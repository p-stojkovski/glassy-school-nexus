/**
 * DemoManager - Centralized demo functionality component
 *
 * This component provides a unified interface for demo mode management,
 * including data reset, export/import, and system status monitoring.
 * It can be used across different management pages for consistent demo functionality.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
} from 'lucide-react';
import { useMockData } from '../hooks/useMockData';
import { toast } from '@/hooks/use-toast';

export interface DemoManagerProps {
  className?: string;
  showFullControls?: boolean;
  compactMode?: boolean;
  title?: string;
  description?: string;
}

export const DemoManager: React.FC<DemoManagerProps> = ({
  className,
  showFullControls = false,
  compactMode = true,
  title = 'Demo Mode',
  description = 'You are currently in demo mode. All changes are temporary.',
}) => {
  const {
    isLoading,
    isInitialized,
    error,
    resetDemoData,
    getDataStats,
    exportData,
    importData: importDataFromJson,
    clearAllData,
    isStorageAvailable,
  } = useMockData();
  const [dataStats, setDataStats] = useState<any>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [exportedData, setExportedData] = useState('');
  const [importData, setImportDataText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Load data stats on mount and when initialized
  const loadDataStats = useCallback(async () => {
    try {
      const stats = await getDataStats();
      setDataStats(stats);
    } catch (err) {
      console.error('Failed to load data stats:', err);
    }
  }, [getDataStats]);

  useEffect(() => {
    if (isInitialized) {
      loadDataStats();
    }
  }, [isInitialized, loadDataStats]);

  const handleExport = async () => {
    try {
      const data = await exportData();
      setExportedData(data);
      setIsExportDialogOpen(true);
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'Unable to export data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadExport = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glassy-school-demo-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Downloaded',
      description: 'Demo data has been downloaded successfully.',
      variant: 'default',
    });
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: 'Import Error',
        description: 'Please paste valid JSON data to import.',
        variant: 'destructive',
      });
      return;
    }
    setIsImporting(true);
    try {
      await importDataFromJson(importData);
      setIsImportDialogOpen(false);
      setImportDataText('');
      await loadDataStats(); // Refresh stats
    } catch (err) {
      // Error handling is done in the hook
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      await loadDataStats();
    } catch (err) {
      toast({
        title: 'Clear Failed',
        description: 'Unable to clear data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (compactMode) {
    return (
      <Card className={`bg-blue-500/10 border-blue-500/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">{title}</span>
            </div>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={resetDemoData}
              disabled={isLoading}
              className="text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Reset
            </Button> */}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-blue-500/10 border-blue-500/20 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-lg text-blue-300">{title}</CardTitle>
            {!isStorageAvailable && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                No Storage
              </Badge>
            )}
            {isInitialized && (
              <Badge
                variant="outline"
                className="text-xs text-green-300 border-green-500/30"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Loaded
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemoData}
            disabled={isLoading}
            className="text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Reset Demo
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-blue-200/80">{description}</p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {dataStats && (
          <div className="space-y-3">
            <Separator className="bg-blue-500/20" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-blue-300">Students</p>
                <p className="font-medium text-white">{dataStats.students}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-300">Classrooms</p>
                <p className="font-medium text-white">{dataStats.classrooms}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-300">Classes</p>
                <p className="font-medium text-white">{dataStats.classes}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-300">Teachers</p>
                <p className="font-medium text-white">{dataStats.teachers}</p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-300">Obligations</p>
                <p className="font-medium text-white">
                  {dataStats.obligations}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-300">Storage</p>
                <p className="font-medium text-white">
                  {formatBytes(dataStats.storageSize)}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-300/70">
              Last updated: {new Date(dataStats.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}

        {showFullControls && (
          <>
            <Separator className="bg-blue-500/20" />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>

              <Dialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-300 border-blue-500/30 hover:bg-blue-500/20"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Import Demo Data
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Paste your exported JSON data below to import it into the
                      system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="import-data" className="text-white">
                        JSON Data
                      </Label>
                      <Textarea
                        id="import-data"
                        placeholder="Paste your JSON data here..."
                        value={importData}
                        onChange={(e) => setImportDataText(e.target.value)}
                        rows={10}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportDialogOpen(false)}
                      className="bg-gray-700 text-white border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={isImporting || !importData.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isImporting ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Import
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Clear All Data
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      This will permanently remove all data from local storage.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Clear All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </CardContent>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Export Demo Data</DialogTitle>
            <DialogDescription className="text-gray-300">
              Your demo data has been exported. You can copy it or download it
              as a file.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exported-data" className="text-white">
                Exported JSON Data
              </Label>
              <Textarea
                id="exported-data"
                value={exportedData}
                readOnly
                rows={10}
                className="bg-gray-800 border-gray-600 text-white font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              className="bg-gray-700 text-white border-gray-600"
            >
              Close
            </Button>
            <Button
              onClick={handleDownloadExport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

