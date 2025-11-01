package keto

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
)

// Client wraps the Keto check API used for authorization decisions.
type Client struct {
	readEndpoint  *url.URL
	writeEndpoint *url.URL
	relation      string
	membership    string
	namespace     string
	httpClient    *http.Client
	logger        *zap.Logger
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
		readEndpoint:  readURL,
		writeEndpoint: writeURL,
		relation:      opts.PermissionRelation,
		membership:    opts.MembershipRelation,
		namespace:     opts.NamespacePrefix,
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

type relationTuple struct {
	Namespace  string      `json:"namespace"`
	Object     string      `json:"object"`
	Relation   string      `json:"relation"`
	SubjectID  string      `json:"subject_id,omitempty"`
	SubjectSet *SubjectSet `json:"subject_set,omitempty"`
}

type SubjectSet struct {
	Namespace string `json:"namespace"`
	Object    string `json:"object"`
	Relation  string `json:"relation"`
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
		ns = "Tenant"
	}

	scope := "global"
	if tenantID != "" {
		scope = tenantID
	}

	object := fmt.Sprintf("%s:%s", scope, role)

	payload := relationTuple{
		Namespace: ns,
		Object:    object,
		Relation:  c.membershipRelation(),
		SubjectID: subject,
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

// RemoveRole detaches the subject from a role namespace relation.
func (c *Client) RemoveRole(ctx context.Context, tenantID, role, subject string) error {
	if c.writeEndpoint == nil {
		return fmt.Errorf("write endpoint not configured")
	}

	ns := c.namespace
	if ns == "" {
		ns = "Tenant"
	}

	scope := "global"
	if tenantID != "" {
		scope = tenantID
	}

	object := fmt.Sprintf("%s:%s", scope, role)

	reqURL := *c.writeEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/relation-tuples")

	query := reqURL.Query()
	query.Set("namespace", ns)
	query.Set("object", object)
	query.Set("relation", c.membershipRelation())
	query.Set("subject_id", subject)
	reqURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, reqURL.String(), nil)
	if err != nil {
		return fmt.Errorf("build role relation delete request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("call keto delete api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 && resp.StatusCode != http.StatusNotFound {
		return fmt.Errorf("keto delete error: %s", resp.Status)
	}

	return nil
}

func (c *Client) AssignGroupMember(ctx context.Context, tenantID, groupID, subject string) error {
	if c.writeEndpoint == nil {
		return fmt.Errorf("write endpoint not configured")
	}

	payload := relationTuple{
		Namespace: "Group",
		Object:    groupObject(tenantID, groupID),
		Relation:  c.membershipRelation(),
		SubjectID: subject,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal group tuple payload: %w", err)
	}

	reqURL := *c.writeEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/relation-tuples")

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, reqURL.String(), bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build group relation request: %w", err)
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

func (c *Client) RemoveGroupMember(ctx context.Context, tenantID, groupID, subject string) error {
	if c.writeEndpoint == nil {
		return fmt.Errorf("write endpoint not configured")
	}

	reqURL := *c.writeEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/relation-tuples")

	query := reqURL.Query()
	query.Set("namespace", "Group")
	query.Set("object", groupObject(tenantID, groupID))
	query.Set("relation", c.membershipRelation())
	query.Set("subject_id", subject)
	reqURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, reqURL.String(), nil)
	if err != nil {
		return fmt.Errorf("build group relation delete request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("call keto delete api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 && resp.StatusCode != http.StatusNotFound {
		return fmt.Errorf("keto delete error: %s", resp.Status)
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

// MembershipRelation returns the relation name used for role membership tuples.
func (c *Client) MembershipRelation() string {
	return c.membershipRelation()
}

// UpsertSubjectSetRelation adds a relation tuple that references a subject set.
func (c *Client) UpsertSubjectSetRelation(ctx context.Context, namespace, object, relation string, subject SubjectSet) error {
	if c.writeEndpoint == nil {
		return fmt.Errorf("write endpoint not configured")
	}

	payload := relationTuple{
		Namespace:  namespace,
		Object:     object,
		Relation:   relation,
		SubjectSet: &subject,
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

// DeleteSubjectSetRelation removes a relation tuple that references a subject set.
func (c *Client) DeleteSubjectSetRelation(ctx context.Context, namespace, object, relation string, subject SubjectSet) error {
	if c.writeEndpoint == nil {
		return fmt.Errorf("write endpoint not configured")
	}

	reqURL := *c.writeEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/relation-tuples")

	query := reqURL.Query()
	query.Set("namespace", namespace)
	query.Set("object", object)
	query.Set("relation", relation)
	query.Set("subject_set.namespace", subject.Namespace)
	query.Set("subject_set.object", subject.Object)
	query.Set("subject_set.relation", subject.Relation)
	reqURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, reqURL.String(), nil)
	if err != nil {
		return fmt.Errorf("build relation delete request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("call keto delete api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 && resp.StatusCode != http.StatusNotFound {
		return fmt.Errorf("keto delete error: %s", resp.Status)
	}

	return nil
}

func groupObject(tenantID, groupID string) string {
	scope := tenantID
	if strings.TrimSpace(scope) == "" {
		scope = "global"
	}
	return fmt.Sprintf("%s:group:%s", scope, groupID)
}
