import { supabase } from '../lib/supabase';

/**
 * 文件上传 API
 * 使用 Supabase Storage 实现图片/视频上传和 CDN 加速
 */

const BUCKET_NAME = 'user-uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/**
 * 上传图片
 */
export async function uploadImage(file: File, folder: string = 'images'): Promise<string> {
  try {
    // 验证文件类型
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('不支持的图片格式,仅支持 JPG、PNG、GIF、WebP');
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`文件过大,最大支持 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 上传文件
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * 上传视频
 */
export async function uploadVideo(file: File, folder: string = 'videos'): Promise<string> {
  try {
    // 验证文件类型
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      throw new Error('不支持的视频格式,仅支持 MP4、WebM、MOV');
    }

    // 验证文件大小(视频限制更大,50MB)
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`视频过大,最大支持 ${MAX_VIDEO_SIZE / 1024 / 1024}MB`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // 上传文件
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
}

/**
 * 删除文件
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // 从 URL 提取文件路径
    const urlParts = fileUrl.split(`/${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      throw new Error('无效的文件 URL');
    }
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * 获取文件的缩略图 URL(使用 Supabase Image Transformation)
 */
export function getThumbnailUrl(imageUrl: string, width: number = 300, height: number = 300): string {
  // Supabase 支持 URL 参数进行图片变换
  // 示例: ?width=300&height=300&resize=cover
  const url = new URL(imageUrl);
  url.searchParams.set('width', width.toString());
  url.searchParams.set('height', height.toString());
  url.searchParams.set('resize', 'cover');
  return url.toString();
}

/**
 * 压缩图片(客户端)
 */
export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 计算缩放比例
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法获取 canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('压缩失败'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 上传多个文件
 */
export async function uploadMultipleFiles(files: File[], folder: string = 'images'): Promise<string[]> {
  const uploadPromises = files.map((file) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return uploadImage(file, folder);
    } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return uploadVideo(file, folder);
    } else {
      return Promise.reject(new Error(`不支持的文件类型: ${file.type}`));
    }
  });

  return Promise.all(uploadPromises);
}
