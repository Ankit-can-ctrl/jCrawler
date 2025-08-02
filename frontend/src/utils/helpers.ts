export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const formatSalary = (salary?: {
  min?: number;
  max?: number;
  currency?: string;
}): string => {
  if (!salary) return "Salary not specified";

  const currency = salary.currency || "USD";
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (salary.min && salary.max) {
    return `${formatCurrency(salary.min)} - ${formatCurrency(salary.max)}`;
  } else if (salary.min) {
    return `${formatCurrency(salary.min)}+`;
  } else if (salary.max) {
    return `Up to ${formatCurrency(salary.max)}`;
  }

  return "Salary not specified";
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatExperience = (experience: string): string => {
  const experienceMap: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior Level",
    lead: "Lead Level",
  };
  return experienceMap[experience] || capitalizeFirst(experience);
};

export const formatJobType = (type: string): string => {
  const typeMap: Record<string, string> = {
    "full-time": "Full Time",
    "part-time": "Part Time",
    contract: "Contract",
    internship: "Internship",
  };
  return typeMap[type] || capitalizeFirst(type);
};

export const getJobTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    "full-time": "#4caf50",
    "part-time": "#ff9800",
    contract: "#2196f3",
    internship: "#9c27b0",
  };
  return colorMap[type] || "#757575";
};

export const getExperienceColor = (experience: string): string => {
  const colorMap: Record<string, string> = {
    entry: "#4caf50",
    mid: "#ff9800",
    senior: "#f44336",
    lead: "#9c27b0",
  };
  return colorMap[experience] || "#757575";
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
