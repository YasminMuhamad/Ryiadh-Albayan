// src/utils/formatDate.js

export const fmt = (ts) => {
    if (!ts) return "-";
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString(); // Date + Time
    } catch {
        return String(ts);
    }
};

export const fmtDateOnly = (ts) => {
    if (!ts) return "-";
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString(); // Date only
    } catch {
        return String(ts);
    }
};

export const fmtDateTime = (ts) => {
    if (!ts) return "-";
    try {
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleString(); // Date + Time
    } catch {
        return String(ts);
    }
};
