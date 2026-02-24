import { useState, useRef } from 'react';
import { AttachmentService } from '../services/attachmentService';

import { Paperclip, Upload, X, File as FileIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
    ticketId: number;
    onUploadComplete: () => void;
    disabled?: boolean;
}

export default function FileUpload({ ticketId, onUploadComplete, disabled }: FileUploadProps) {
    const { t } = useTranslation();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        try {
            for (const file of files) {
                await AttachmentService.upload(ticketId, file);
            }
            setFiles([]);
            onUploadComplete();
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled}
            />

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploading}
                    className="flex-1"
                >
                    <Paperclip className="w-4 h-4" />
                    {t('upload.select_files')}
                </Button>

                {files.length > 0 && (
                    <Button
                        onClick={handleUpload}
                        isLoading={uploading}
                        disabled={disabled}
                    >
                        <Upload className="w-4 h-4" />
                        {t('upload.upload_btn')} {files.length} {files.length === 1 ? t('upload.file') : t('upload.files')}
                    </Button>
                )}
            </div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {files.map((file, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-3 p-3 bg-white/5/40 border border-white/10 rounded-xl"
                            >
                                <FileIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                                    disabled={uploading}
                                >
                                    <X className="w-4 h-4 text-slate-400" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
