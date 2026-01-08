import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { uploadImage, uploadVideo, compressImage } from '../api/storage';

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  accept?: 'image' | 'video' | 'both';
  multiple?: boolean;
  maxFiles?: number;
  compress?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  accept = 'image',
  multiple = false,
  maxFiles = 5,
  compress = true,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = () => {
    if (accept === 'image') return 'image/jpeg,image/png,image/gif,image/webp';
    if (accept === 'video') return 'video/mp4,video/webm,video/quicktime';
    return 'image/*,video/*';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 限制文件数量
    if (files.length > maxFiles) {
      setError(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    setUploading(true);
    setError(null);
    const urls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        let fileToUpload = file;

        // 如果是图片且需要压缩
        if (compress && file.type.startsWith('image/')) {
          try {
            setUploadProgress((prev) => ({ ...prev, [file.name]: 30 }));
            fileToUpload = await compressImage(file);
          } catch (err) {
            console.warn('压缩失败,使用原图:', err);
          }
        }

        setUploadProgress((prev) => ({ ...prev, [file.name]: 50 }));

        // 上传文件
        let url: string;
        if (file.type.startsWith('image/')) {
          url = await uploadImage(fileToUpload);
        } else if (file.type.startsWith('video/')) {
          url = await uploadVideo(fileToUpload);
        } else {
          throw new Error('不支持的文件类型');
        }

        urls.push(url);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }

      setUploadedUrls(urls);
      onUploadComplete(urls);
    } catch (err: any) {
      setError(err.message || '上传失败');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      // 清空 input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getIcon = () => {
    if (accept === 'image') return <ImageIcon className="w-8 h-8" />;
    if (accept === 'video') return <Video className="w-8 h-8" />;
    return <Upload className="w-8 h-8" />;
  };

  const getLabel = () => {
    if (accept === 'image') return '选择图片';
    if (accept === 'video') return '选择视频';
    return '选择文件';
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes()}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button/Area */}
      {!uploading && uploadedUrls.length === 0 && (
        <div
          onClick={handleClick}
          className="border-4 border-dashed border-black p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          {getIcon()}
          <p className="font-black uppercase mt-4">{getLabel()}</p>
          <p className="text-sm font-bold text-gray-500 mt-2">
            {multiple ? `最多 ${maxFiles} 个文件` : '单个文件'}
          </p>
        </div>
      )}

      {/* Uploading Progress */}
      {uploading && (
        <div className="border-4 border-black p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-black uppercase">上传中...</span>
          </div>
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold truncate flex-1">{fileName}</span>
                <span className="text-xs font-black ml-2">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 border-2 border-black">
                <div
                  className="h-full bg-vibe-yellow transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Success */}
      {!uploading && uploadedUrls.length > 0 && (
        <div className="border-4 border-green-500 p-6 bg-green-50">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="font-black uppercase text-green-600">上传成功!</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative">
                {url.includes('video') ? (
                  <video src={url} className="w-full h-32 object-cover border-2 border-black" />
                ) : (
                  <img src={url} alt={`Uploaded ${index}`} className="w-full h-32 object-cover border-2 border-black" />
                )}
              </div>
            ))}
          </div>
          <Button onClick={handleClick} className="mt-4 w-full bg-black text-white">
            再次上传
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="border-4 border-red-500 p-4 bg-red-50 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-black uppercase text-red-600 mb-1">上传失败</p>
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)}>
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
