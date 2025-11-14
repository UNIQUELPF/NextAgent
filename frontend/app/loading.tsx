"use client";

export default function GlobalLoading() {
  return (
    <div className="page-loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="page-loading-indicator" />
      <p className="page-loading-text">页面加载中...</p>
    </div>
  );
}
