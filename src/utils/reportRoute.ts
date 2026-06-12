const reportPathPattern = /^\/relatorio\/([a-z0-9][a-z0-9_-]{0,79})\/?$/i;

export const getReportSlugFromPathname = (pathname: string) => {
  const match = reportPathPattern.exec(pathname.trim());

  return match ? match[1].toLowerCase() : "";
};
