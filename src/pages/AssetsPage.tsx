import React, { useState } from 'react';
import { Search, Filter, FolderOpen } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"
import { useAuth } from "../hooks/auth/useAuth"
import FileUpload from "../components/assets/FileUpload"
import AssetCard from "../components/assets/AssetCard"
import { useGetAssets } from "../hooks/assets/useGetAssets"
import { AssetFile } from "../types/asset"

export default function AssetsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: assets = [], isLoading: loading, refetch } = useGetAssets();

  const handleUploadComplete = () => {
    refetch();
  };

  const handleDelete = (fileName: string) => {
    refetch();
  };

  const filteredAssets = assets.filter(asset => {
    const fileName = asset.name;
    return fileName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Please sign in to access your assets
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Asset Hub</h2>
          <p className="text-muted-foreground">Upload and manage your documents, images, and media files</p>
        </div>
        <FileUpload onUploadComplete={handleUploadComplete} variant="gradient" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search assets..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Assets</h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-32"></div>
              </div>
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="min-w-0">
                <AssetCard
                  file={{
                    ...asset,
                    name: `${user.id}/${asset.name}`
                  }}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No assets found' : 'No assets yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms.' 
                : 'Upload your first asset to get started.'
              }
            </p>
            {!searchTerm && <FileUpload onUploadComplete={handleUploadComplete} />}
          </div>
        )}
      </div>
    </div>
  );
}