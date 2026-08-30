"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, Upload, FileText, Trash2, RefreshCw, CheckCircle, XCircle,
  Clock, AlertCircle, Loader2, Search, ArrowLeft, ChevronDown, ChevronUp
} from "lucide-react";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../store/authStore";
import ProtectedRoute from "../../../components/ProtectedRoute";

interface Document {
  id: number; name: string; fileName: string; fileType: string; fileSize: number;
  status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
  pageCount: number; chunkCount: number; processingError: string | null;
  createdAt: string; uploadedBy: number;
}

const STATUS_CONFIG = {
  PROCESSED: { label: "Processed", cls: "badge-success", icon: <CheckCircle size={12} /> },
  PROCESSING: { label: "Processing", cls: "badge-warning", icon: <Loader2 size={12} className="animate-spin" /> },
  UPLOADED:   { label: "Uploaded", cls: "badge-info", icon: <Clock size={12} /> },
  FAILED:     { label: "Failed", cls: "badge-danger", icon: <XCircle size={12} /> },
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function fmtDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

export default function AdminDocumentsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <DocumentsContent />
    </ProtectedRoute>
  );
}

function DocumentsContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadName, setUploadName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
    const interval = setInterval(loadDocuments, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDocuments = async () => {
    try {
      const { data } = await api.get("/documents?limit=100");
      setDocuments(data.documents || []);
    } catch {} finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadName(file.name.replace(/\.[^/.]+$/, ""));
    setUploadError("");
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setUploadError("Please select a file."); return; }
    setUploading(true); setUploadError("");
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("name", uploadName || selectedFile.name);
    try {
      await api.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSelectedFile(null); setUploadName("");
      if (fileRef.current) fileRef.current.value = "";
      await loadDocuments();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || "Upload failed.");
    } finally { setUploading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this document? All associated chunks will be removed.")) return;
    setActionLoading(prev => ({ ...prev, [id]: "delete" }));
    try { await api.delete(`/documents/${id}`); await loadDocuments(); }
    catch (err: any) { alert(err.response?.data?.message || "Delete failed."); }
    finally { setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; }); }
  };

  const handleReprocess = async (id: number) => {
    setActionLoading(prev => ({ ...prev, [id]: "reprocess" }));
    try { await api.post(`/documents/${id}/reprocess`); await loadDocuments(); }
    catch (err: any) { alert(err.response?.data?.message || "Reprocess failed."); }
    finally { setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n; }); }
  };

  const filtered = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center gap-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <button onClick={() => router.push("/admin")} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary), var(--accent))" }}>
            <Brain size={14} className="text-white" />
          </div>
          <span className="font-bold gradient-text">CollegeAI</span>
        </div>
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>/ Document Management</span>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Document Management</h1>
          <p style={{ color: "var(--text-secondary)" }}>Upload and manage your college knowledge base</p>
        </div>

        {/* Upload section */}
        <div className="card mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Upload size={16} style={{ color: "var(--primary)" }} /> Upload Document</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                <AlertCircle size={14} />{uploadError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Document Name</label>
                <input type="text" value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="e.g. Admission Guidelines 2026" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>File (PDF, DOCX, TXT · max 20MB)</label>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileChange}
                  className="input" style={{ paddingTop: "0.45rem", cursor: "pointer" }} />
              </div>
            </div>
            {selectedFile && (
              <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Selected: <span style={{ color: "var(--text-primary)" }}>{selectedFile.name}</span> ({fmtSize(selectedFile.size)})
              </div>
            )}
            <button type="submit" disabled={uploading || !selectedFile} className="btn-primary flex items-center gap-2">
              {uploading ? <><Loader2 size={14} className="animate-spin" />Uploading &amp; Processing...</> : <><Upload size={14} />Upload &amp; Process</>}
            </button>
          </form>
        </div>

        {/* Documents list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Documents ({filtered.length})</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-8 py-1.5 text-sm" style={{ width: "200px" }} />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={36} className="mx-auto mb-3 opacity-20" />
              <p style={{ color: "var(--text-muted)" }}>{search ? "No documents match your search." : "No documents uploaded yet."}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(doc => {
                const sc = STATUS_CONFIG[doc.status];
                const isExpanded = expandedId === doc.id;
                const action = actionLoading[doc.id];
                return (
                  <div key={doc.id} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}>
                    <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : doc.id)}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{doc.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.fileName} · {fmtSize(doc.fileSize)} · {fmtDate(doc.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`badge ${sc.cls} flex items-center gap-1`}>{sc.icon}{sc.label}</span>
                        {doc.status === "PROCESSED" && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{doc.chunkCount} chunks</span>}
                        <div className="flex gap-1">
                          {(doc.status === "FAILED" || doc.status === "PROCESSED") && (
                            <button onClick={e => { e.stopPropagation(); handleReprocess(doc.id); }} disabled={!!action}
                              className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-secondary)" }} title="Reprocess">
                              {action === "reprocess" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); handleDelete(doc.id); }} disabled={!!action}
                            className="p-1.5 rounded-lg transition-colors hover:text-red-400" style={{ color: "var(--text-secondary)" }} title="Delete">
                            {action === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                        {isExpanded ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />}
                      </div>
                    </div>

                    {/* Expanded metadata */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: "var(--border)" }}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
                          {[
                            { label: "Pages", value: doc.pageCount || "—" },
                            { label: "Chunks", value: doc.chunkCount || "—" },
                            { label: "Format", value: doc.fileType.split("/").pop()?.toUpperCase() || "—" },
                            { label: "Size", value: fmtSize(doc.fileSize) },
                          ].map(item => (
                            <div key={item.label} className="p-2 rounded-lg" style={{ background: "var(--surface)" }}>
                              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{item.label}</div>
                              <div className="font-medium">{item.value}</div>
                            </div>
                          ))}
                        </div>
                        {doc.processingError && (
                          <div className="mt-3 p-3 rounded-lg text-sm flex items-start gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                            <span>{doc.processingError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
