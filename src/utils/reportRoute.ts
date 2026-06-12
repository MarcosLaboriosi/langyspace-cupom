const reportPathPattern = /^\/relatorio\/([A-Za-z0-9_-]{12,160})\/?$/;

export const getReportIdFromPathname = (pathname: string) => {
  const match = reportPathPattern.exec(pathname.trim());

  return match ? match[1] : "";
};
