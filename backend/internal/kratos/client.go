package kratos

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"
)

type Client struct {
	adminEndpoint  *url.URL
	publicEndpoint *url.URL
	schemaID       string
	httpClient     *http.Client
	logger         *zap.Logger
}

type Options struct {
	AdminURL  string
	PublicURL string
	SchemaID  string
	Timeout   time.Duration
}

func NewClient(opts Options, logger *zap.Logger) (*Client, error) {
	if opts.AdminURL == "" {
		return nil, fmt.Errorf("kratos admin url is required")
	}

	adminURL, err := url.Parse(opts.AdminURL)
	if err != nil {
		return nil, fmt.Errorf("parse kratos admin url: %w", err)
	}

	var publicURL *url.URL
	if opts.PublicURL != "" {
		publicURL, err = url.Parse(opts.PublicURL)
		if err != nil {
			return nil, fmt.Errorf("parse kratos public url: %w", err)
		}
	}

	timeout := opts.Timeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}

	schemaID := opts.SchemaID
	if schemaID == "" {
		schemaID = "default"
	}

	return &Client{
		adminEndpoint:  adminURL,
		publicEndpoint: publicURL,
		schemaID:       schemaID,
		httpClient: &http.Client{
			Timeout: timeout,
		},
		logger: logger.Named("kratos"),
	}, nil
}

type Identity struct {
	ID     string         `json:"id"`
	Traits map[string]any `json:"traits"`
}

func (c *Client) FindIdentityByIdentifier(ctx context.Context, identifier string) (*Identity, error) {
	reqURL := *c.adminEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/admin/identities")
	q := reqURL.Query()
	q.Set("credentials_identifier", identifier)
	reqURL.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("build kratos request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("exec kratos request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, nil
	}

	if resp.StatusCode >= 400 {
		return nil, c.decodeError(resp)
	}

	var result []Identity
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode kratos identities: %w", err)
	}
	if len(result) == 0 {
		return nil, nil
	}
	return &result[0], nil
}

type CreateIdentityInput struct {
	Phone    string
	Nickname string
	UserType string
	TenantID string
	Roles    []string
	Password string
}

func (c *Client) CreateIdentity(ctx context.Context, input CreateIdentityInput) (*Identity, error) {
	reqURL := *c.adminEndpoint
	reqURL.Path = path.Join(reqURL.Path, "/admin/identities")

	schemaID := c.schemaID
	if schemaID == "" {
		schemaID = "default"
	}

	traits := map[string]any{
		"phone":     strings.TrimSpace(input.Phone),
		"nickname":  strings.TrimSpace(input.Nickname),
		"user_type": strings.TrimSpace(input.UserType),
	}
	if input.TenantID != "" {
		traits["tenant_id"] = input.TenantID
	}
	if len(input.Roles) > 0 {
		traits["roles"] = input.Roles
	}

	payload := map[string]any{
		"schema_id": schemaID,
		"state":     "active",
		"traits":    traits,
	}

	if input.Password != "" {
		payload["credentials"] = map[string]any{
			"password": map[string]any{
				"config": map[string]any{
					"password": input.Password,
				},
			},
		}
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("marshal kratos payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, reqURL.String(), bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("build kratos request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("exec kratos request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, c.decodeError(resp)
	}

	var result Identity
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decode kratos identity: %w", err)
	}
	return &result, nil
}

func (c *Client) decodeError(resp *http.Response) error {
	var payload struct {
		Error struct {
			Message string `json:"message"`
			Reason  string `json:"reason"`
			Debug   string `json:"debug"`
		} `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return fmt.Errorf("kratos error: %s", resp.Status)
	}
	if payload.Error.Message != "" {
		msg := payload.Error.Message
		if payload.Error.Reason != "" {
			msg = fmt.Sprintf("%s: %s", msg, payload.Error.Reason)
		}
		if payload.Error.Debug != "" {
			msg = fmt.Sprintf("%s (%s)", msg, payload.Error.Debug)
		}
		return errors.New(msg)
	}
	return fmt.Errorf("kratos error: %s", resp.Status)
}
