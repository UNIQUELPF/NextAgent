package keto

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"time"

	"go.uber.org/zap"
)

// Client wraps the Keto check API used for authorization decisions.
type Client struct {
	readEndpoint *url.URL
	writeEndpoint *url.URL
	relation     string
	membership   string
	namespace    string
	httpClient   *http.Client
	logger       *zap.Logger
}

// Options configures the Client.
type Options struct {
	ReadRemote         string
	WriteRemote        string
	PermissionRelation string
	MembershipRelation string
	NamespacePrefix    string
	Timeout            time.Duration
}

// NewClient builds a Keto client backed by net/http.
func NewClient(opts Options, logger *zap.Logger) (*Client, error) {
	if opts.ReadRemote == "" {
		return nil, fmt.Errorf("missing read remote")
	}

	readURL, err := url.Parse(opts.ReadRemote)
	if err != nil {
		return nil, fmt.Errorf("parse read remote: %w", err)
	}

	var writeURL *url.URL
	if opts.WriteRemote != "" {
		writeURL, err = url.Parse(opts.WriteRemote)
		if err != nil {
			return nil, fmt.Errorf("parse write remote: %w", err)
		}
	}

	timeout := opts.Timeout
	if timeout <= 0 {
		timeout = 2 * time.Second
	}

	return &Client{
		readEndpoint: readURL,
		writeEndpoint: writeURL,
		relation:     opts.PermissionRelation,
		membership:   opts.MembershipRelation,
		namespace:    opts.NamespacePrefix,
		httpClient: &http.Client{
			Timeout: timeout,
		},
		logger: logger.Named("keto"),
	}, nil
}

type checkRequest struct {
	Namespace string        `json:"namespace"`
	Object    string        `json:"object"`
	Relation  string        `json:"relation"`
	Subject   subjectStruct `json:"subject"`
}

type subjectStruct struct {
	ID string `json:"id"`
}

type checkResponse struct {
	Allowed bool `json:"allowed"`
}

// Check queries Keto to determine whether the subject may perform the action on the object.
func (c *Client) Check(ctx context.Context, namespace, object, action, subject string) (bool, error) {
	payload := checkRequest{
		Namespace: namespace,
		Object:    object,
		Relation:  c.resolveRelation(action),
		Subject: subjectStruct{
			ID: subject,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return false, fmt.Errorf("marshal payload: %w", err)
	}

	reqURL := *c.readEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/relation-tuples/check")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL.String(), bytes.NewReader(body))
	if err != nil {
		return false, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return false, fmt.Errorf("call keto: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 500 {
		return false, fmt.Errorf("keto server error: %s", resp.Status)
	}
	if resp.StatusCode == http.StatusNotFound {
		return false, nil
	}
	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("unexpected keto status: %s", resp.Status)
	}

	var result checkResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, fmt.Errorf("decode keto response: %w", err)
	}

	return result.Allowed, nil
}

// AssignRole ensures the subject belongs to a role namespace, creating the relation tuple if required.
func (c *Client) AssignRole(ctx context.Context, tenantID, role, subject string) error {
	if c.writeEndpoint == nil {
		return fmt.Errorf("write endpoint not configured")
	}

	ns := c.namespace
	if ns == "" {
		ns = "tenant"
	}
	namespace := ns + ":global"
	if tenantID != "" {
		namespace = fmt.Sprintf("%s:%s", ns, tenantID)
	}

	payload := checkRequest{
		Namespace: namespace,
		Object:    role,
		Relation:  c.membershipRelation(),
		Subject: subjectStruct{
			ID: subject,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal tuple payload: %w", err)
	}

	reqURL := *c.writeEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/relation-tuples")

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, reqURL.String(), bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build relation request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("call keto write api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("keto write error: %s", resp.Status)
	}

	return nil
}

func (c *Client) resolveRelation(action string) string {
	if action != "" {
		return action
	}
	if c.relation != "" {
		return c.relation
	}
	return "can"
}

func (c *Client) membershipRelation() string {
	if c.membership != "" {
		return c.membership
	}
	return "member"
}
