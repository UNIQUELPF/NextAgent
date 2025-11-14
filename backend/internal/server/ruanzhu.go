package server

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"github.com/laofa009/next-agent-portal/backend/internal/agents/ruanzhu"
	"github.com/laofa009/next-agent-portal/backend/internal/middleware"
)

func (s *Server) registerRuanzhuRoutes(group *gin.RouterGroup) {
	if s.ruanzhuClient == nil {
		s.logger.Warn("ruanzhu client not configured; skipping agent routes")
		return
	}

	ruanzhuGroup := group.Group("/ruanzhu")
	ruanzhuGroup.GET("/configs", s.handleRuanzhuListConfigs)
	ruanzhuGroup.POST("/configs", s.handleRuanzhuCreateConfig)
	ruanzhuGroup.PUT("/configs/:id", s.handleRuanzhuUpdateConfig)
	ruanzhuGroup.DELETE("/configs/:id", s.handleRuanzhuDeleteConfig)

	ruanzhuGroup.GET("/tasks", s.handleRuanzhuListTasks)
	ruanzhuGroup.POST("/tasks", s.handleRuanzhuCreateTask)
	ruanzhuGroup.GET("/tasks/:task_id", s.handleRuanzhuGetTask)
	ruanzhuGroup.POST("/tasks/:task_id/remove", s.handleRuanzhuRemoveTask)
	ruanzhuGroup.POST("/tasks/batch-remove", s.handleRuanzhuBatchRemove)
	ruanzhuGroup.GET("/tasks/:task_id/code-files", s.handleRuanzhuListCodeFiles)
	ruanzhuGroup.GET("/tasks/:task_id/download", s.handleRuanzhuDownloadFile)
	ruanzhuGroup.GET("/tasks/:task_id/download-full", s.handleRuanzhuDownloadFullTask)

	ruanzhuGroup.GET("/statistics", s.handleRuanzhuStatistics)
}

func (s *Server) handleRuanzhuListConfigs(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}

	configs, err := s.ruanzhuClient.ListConfigs(c.Request.Context())
	if err != nil {
		s.logger.Error("list ruanzhu configs failed", zap.Error(err))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to load agent configs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"configs": configs})
}

func (s *Server) handleRuanzhuCreateConfig(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}
	var payload ruanzhu.ConfigPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	resp, err := s.ruanzhuClient.CreateConfig(c.Request.Context(), payload)
	if err != nil {
		s.logger.Error("create ruanzhu config failed", zap.Error(err))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to create config"})
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func (s *Server) handleRuanzhuUpdateConfig(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}
	configID, err := strconv.Atoi(c.Param("id"))
	if err != nil || configID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid config id"})
		return
	}

	var payload ruanzhu.ConfigPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	resp, err := s.ruanzhuClient.UpdateConfig(c.Request.Context(), configID, payload)
	if err != nil {
		s.logger.Error("update ruanzhu config failed", zap.Error(err), zap.Int("config_id", configID))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to update config"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (s *Server) handleRuanzhuDeleteConfig(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}
	configID, err := strconv.Atoi(c.Param("id"))
	if err != nil || configID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid config id"})
		return
	}

	resp, err := s.ruanzhuClient.DeleteConfig(c.Request.Context(), configID)
	if err != nil {
		s.logger.Error("delete ruanzhu config failed", zap.Error(err), zap.Int("config_id", configID))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to delete config"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (s *Server) handleRuanzhuListTasks(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}

	tasks, err := s.ruanzhuClient.ListTasks(c.Request.Context())
	if err != nil {
		s.logger.Error("list ruanzhu tasks failed", zap.Error(err))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to load tasks"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": tasks})
}

func (s *Server) handleRuanzhuCreateTask(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}

	var payload ruanzhu.TaskRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if strings.TrimSpace(payload.SoftwareName) == "" || payload.ConfigID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "software_name and config_id are required"})
		return
	}

	task, err := s.ruanzhuClient.CreateTask(c.Request.Context(), payload)
	if err != nil {
		s.logger.Error("create ruanzhu task failed", zap.Error(err))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to create task"})
		return
	}
	c.JSON(http.StatusCreated, task)
}

func (s *Server) handleRuanzhuGetTask(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}

	taskID := c.Param("task_id")
	if strings.TrimSpace(taskID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "task_id is required"})
		return
	}

	task, err := s.ruanzhuClient.GetTask(c.Request.Context(), taskID)
	if err != nil {
		s.logger.Error("get ruanzhu task failed", zap.Error(err), zap.String("task_id", taskID))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to load task"})
		return
	}
	c.JSON(http.StatusOK, task)
}

func (s *Server) handleRuanzhuRemoveTask(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}
	taskID := c.Param("task_id")
	if strings.TrimSpace(taskID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "task_id is required"})
		return
	}

	resp, err := s.ruanzhuClient.RemoveTask(c.Request.Context(), taskID)
	if err != nil {
		s.logger.Error("remove ruanzhu task failed", zap.Error(err), zap.String("task_id", taskID))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to remove task"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (s *Server) handleRuanzhuBatchRemove(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}

	var payload struct {
		TaskIDs []string `json:"task_ids"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil || len(payload.TaskIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "task_ids is required"})
		return
	}

	resp, err := s.ruanzhuClient.BatchRemoveTasks(c.Request.Context(), payload.TaskIDs)
	if err != nil {
		s.logger.Error("batch remove ruanzhu tasks failed", zap.Error(err))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to remove tasks"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (s *Server) handleRuanzhuListCodeFiles(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}
	taskID := c.Param("task_id")
	if strings.TrimSpace(taskID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "task_id is required"})
		return
	}

	files, err := s.ruanzhuClient.ListCodeFiles(c.Request.Context(), taskID)
	if err != nil {
		s.logger.Error("list ruanzhu code files failed", zap.Error(err), zap.String("task_id", taskID))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to load code files"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": files})
}

func (s *Server) handleRuanzhuDownloadFile(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}
	taskID := c.Param("task_id")
	fileType := strings.TrimSpace(c.Query("type"))
	if taskID == "" || fileType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "task_id and type are required"})
		return
	}

	relativePath, err := buildDownloadPath(taskID, fileType, c.Query("filename"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := s.ruanzhuClient.Download(c.Request.Context(), relativePath, nil)
	if err != nil {
		s.logger.Error("download ruanzhu file failed", zap.Error(err), zap.String("task_id", taskID), zap.String("type", fileType))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to download file"})
		return
	}
	defer resp.Body.Close()

	copyDownloadHeaders(c, resp.Header)
	contentType := resp.Header.Get("Content-Type")
	c.DataFromReader(resp.StatusCode, resp.ContentLength, contentType, resp.Body, nil)
}

func (s *Server) handleRuanzhuDownloadFullTask(c *gin.Context) {
	if _, ok := s.requireIdentity(c); !ok {
		return
	}
	taskID := c.Param("task_id")
	if strings.TrimSpace(taskID) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "task_id is required"})
		return
	}

	resp, err := s.ruanzhuClient.Download(c.Request.Context(), fmt.Sprintf("/api/download-full/%s", taskID), nil)
	if err != nil {
		s.logger.Error("download ruanzhu full task failed", zap.Error(err), zap.String("task_id", taskID))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to download task files"})
		return
	}
	defer resp.Body.Close()

	copyDownloadHeaders(c, resp.Header)
	contentType := resp.Header.Get("Content-Type")
	c.DataFromReader(resp.StatusCode, resp.ContentLength, contentType, resp.Body, nil)
}

func (s *Server) handleRuanzhuStatistics(c *gin.Context) {
	if !s.requireAdmin(c) {
		return
	}

	stats, err := s.ruanzhuClient.GetStatistics(c.Request.Context())
	if err != nil {
		s.logger.Error("ruanzhu stats failed", zap.Error(err))
		c.JSON(http.StatusBadGateway, gin.H{"error": "failed to load statistics"})
		return
	}
	c.JSON(http.StatusOK, stats)
}

func buildDownloadPath(taskID, fileType, filename string) (string, error) {
	switch fileType {
	case "all-files":
		return fmt.Sprintf("/api/download/%s/all-files", taskID), nil
	case "code-file":
		if strings.TrimSpace(filename) == "" {
			return "", fmt.Errorf("filename is required for code-file type")
		}
		return fmt.Sprintf("/api/download/%s/code/%s", taskID, url.PathEscape(filename)), nil
	case "full-task":
		return fmt.Sprintf("/api/download-full/%s", taskID), nil
	default:
		return fmt.Sprintf("/api/download/%s/%s", taskID, fileType), nil
	}
}

func copyDownloadHeaders(c *gin.Context, header http.Header) {
	for key, values := range header {
		if len(values) == 0 {
			continue
		}
		switch strings.ToLower(key) {
		case "content-length", "transfer-encoding":
			// handled by gin
			continue
		default:
			c.Header(key, values[len(values)-1])
		}
	}
}

func (s *Server) requireIdentity(c *gin.Context) (*middleware.IdentityContext, bool) {
	ctx := middleware.IdentityFromContext(c)
	if ctx == nil || strings.TrimSpace(ctx.Subject) == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return nil, false
	}
	return ctx, true
}
