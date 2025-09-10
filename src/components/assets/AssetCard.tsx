import React from 'react';
import { Eye, Download, Trash2, FileText, Image, Music, Video, FileSpreadsheet, Presentation } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useToast } from '../ui/use-toast';
import { AssetFile } from '../../types/asset';
import { useDeleteAsset } from '../../hooks/assets/useDeleteAsset';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface AssetCardProps {
  file: AssetFile;
  onDelete: (fileName: string) => void;
}

export default function AssetCard({ file, onDelete }: AssetCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteAsset();

  const getFileIcon = (mimetype: string = 'application/octet-stream') => {
    if (mimetype.startsWith('image/')) return Image;
    if (mimetype.startsWith('video/')) return Video;
    if (mimetype.startsWith('audio/')) return Music;
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return FileSpreadsheet;
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return Presentation;
    return FileText;
  };

  const getFileType = (mimetype: string = 'application/octet-stream') => {
    if (mimetype.startsWith('image/')) return 'Image';
    if (mimetype.startsWith('video/')) return 'Video';
    if (mimetype.startsWith('audio/')) return 'Audio';
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'Spreadsheet';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'Presentation';
    if (mimetype.includes('pdf')) return 'PDF';
    if (mimetype.includes('word')) return 'Document';
    return 'File';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePreview = async () => {
    try {
      if (!user?.id) throw new Error('No user ID');
      
      // Use the same path logic as delete - construct full path for storage operations
      const filePath = file.name.includes('/') ? file.name : `${user.id}/${file.name}`;
      
      const { data } = await supabase.storage
        .from('user-assets')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (data?.signedUrl) {
        setPreviewUrl(data.signedUrl);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: 'Preview failed',
        description: 'Could not generate preview for this file',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    try {
      if (!user?.id) throw new Error('No user ID');
      
      // Use the same path logic as delete - construct full path for storage operations
      const filePath = file.name.includes('/') ? file.name : `${user.id}/${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('user-assets')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      const downloadName = file.name.split('/').pop() || 'download';
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your file download has begun',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'There was an error downloading the file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    deleteAsset(file.name, {
      onSuccess: () => {
        onDelete(file.name);
        toast({
          title: 'File deleted',
          description: 'The file has been successfully deleted',
        });
      },
      onError: (error) => {
        console.error('Delete error:', error);
        toast({
          title: 'Delete failed',
          description: 'There was an error deleting the file',
          variant: 'destructive',
        });
      }
    });
  };

  const IconComponent = getFileIcon(file.metadata?.mimetype);
  const fileName = file.metadata?.originalName || file.name.split('/').pop() || file.name;

  const canPreview = file.metadata?.mimetype?.startsWith('image/') || 
                    file.metadata?.mimetype?.startsWith('video/') || 
                    file.metadata?.mimetype?.startsWith('audio/') ||
                    file.metadata?.mimetype?.includes('pdf');

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                <IconComponent className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate max-w-full" title={fileName}>
                  {fileName}
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {getFileType(file.metadata?.mimetype)} • {formatFileSize(file.metadata?.size || 0)}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {formatDate(file.created_at)}
            </p>
            <div className="flex items-center gap-1">
              {canPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePreview}
                  className="h-8 w-8 p-0"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{fileName}</DialogTitle>
            <DialogDescription>
              {getFileType(file.metadata?.mimetype)} • {formatFileSize(file.metadata?.size || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewUrl && (
              <div className="w-full h-full flex items-center justify-center">
                {file.metadata?.mimetype?.startsWith('image/') && (
                  <img 
                    src={previewUrl} 
                    alt={fileName}
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                {file.metadata?.mimetype?.startsWith('video/') && (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="max-w-full max-h-full"
                  />
                )}
                {file.metadata?.mimetype?.startsWith('audio/') && (
                  <audio 
                    src={previewUrl} 
                    controls 
                    className="w-full"
                  />
                )}
                {file.metadata?.mimetype?.includes('pdf') && (
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-96"
                    title={fileName}
                  />
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}