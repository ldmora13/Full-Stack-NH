import { FileText, Download, Image as ImageIcon, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Attachment {
    id: number;
    filename: string;
    url: string;
    fileType: string | null;
    size: number | null;
    createdAt: string;
    uploader: {
        name: string;
        email: string;
    };
}

interface AttachmentListProps {
    attachments: Attachment[];
}

export default function AttachmentList({ attachments }: AttachmentListProps) {
    const { t, i18n } = useTranslation();

    if (!attachments || attachments.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">{t('attachments.no_attachments')}</p>
            </div>
        );
    }

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return t('attachments.unknown_size');
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getFileIcon = (fileType: string | null) => {
        if (!fileType) return <File className="w-6 h-6" />;

        if (fileType.startsWith('image/')) {
            return <ImageIcon className="w-6 h-6" />;
        }
        return <FileText className="w-6 h-6" />;
    };

    const isImage = (fileType: string | null) => {
        return fileType?.startsWith('image/') || false;
    };

    return (
        <div className="space-y-3">
            {attachments.map((attachment) => (
                <div
                    key={attachment.id}
                    className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-colors"
                >
                    <div className="flex items-start gap-4">
                        {/* Icon/Preview */}
                        <div className="flex-shrink-0">
                            {isImage(attachment.fileType) && attachment.url ? (
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800">
                                    <img
                                        src={attachment.url}
                                        alt={attachment.filename}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                    {getFileIcon(attachment.fileType)}
                                </div>
                            )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-200 truncate mb-1">
                                {attachment.filename}
                            </h4>
                            <div className="text-xs text-slate-500 space-y-0.5">
                                <p>
                                    {formatFileSize(attachment.size)} • {t('attachments.uploaded_by', { name: attachment.uploader.name })}
                                </p>
                                <p>{formatDate(attachment.createdAt)}</p>
                            </div>
                        </div>

                        {/* Download Button */}
                        <a
                            href={attachment.url}
                            download={attachment.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title={t('attachments.download')}
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
}
