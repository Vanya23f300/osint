'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Download, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBoardStore } from '@/lib/store';
import { format } from 'date-fns';

export default function ExportPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;
  
  const { currentBoard, thoughts, getEvidenceForThought } = useBoardStore();

  if (!currentBoard || currentBoard.id !== boardId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const supportedThoughts = thoughts.filter((t) => t.status === 'Supported');
  const claims = thoughts.filter((t) => t.type === 'Claim');
  const openQuestions = thoughts.filter((t) => t.type === 'Question' && t.status === 'Open');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/boards/${boardId}`)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Export Case</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentBoard.title}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy Summary
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Download JSON
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export to Case System
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Options */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include only Supported claims</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include key evidence only</span>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include disproved appendix</span>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thoughts by Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {thoughts.map((thought) => (
                  <div key={thought.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="shrink-0">
                        {thought.type}
                      </Badge>
                      <span className="truncate">{thought.title}</span>
                    </div>
                    <Badge variant={thought.status === 'Supported' ? 'default' : 'secondary'}>
                      {thought.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Draft Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Investigation into {currentBoard.title.toLowerCase()}. Analysis includes {thoughts.length} thoughts with {supportedThoughts.length} supported findings.
                  </p>
                </div>

                <Separator />

                {/* Findings */}
                <div>
                  <h3 className="font-semibold mb-3">Key Findings</h3>
                  <div className="space-y-4">
                    {claims.map((claim) => {
                      const evidence = getEvidenceForThought(claim.id);
                      const keyEvidence = evidence.filter((e) => e.link.isKey && e.link.relation === 'Supports');
                      
                      return (
                        <div key={claim.id} className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge variant={claim.status === 'Supported' ? 'default' : 'secondary'}>
                              {claim.status}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{claim.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{claim.body}</p>
                              {claim.confidence && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Confidence: {claim.confidence}%
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {keyEvidence.length > 0 && (
                            <div className="ml-6 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Key Evidence:</p>
                              {keyEvidence.map((ev) => (
                                <div key={ev.id} className="text-xs text-muted-foreground">
                                  • {ev.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Open Questions */}
                {openQuestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Open Questions</h3>
                    <div className="space-y-2">
                      {openQuestions.map((question) => (
                        <div key={question.id} className="text-sm">
                          • {question.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold mb-2">Investigation Timeline</h3>
                  <p className="text-sm text-muted-foreground">
                    Started: {format(new Date(currentBoard.createdAt), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last Updated: {format(new Date(currentBoard.updatedAt), 'MMMM d, yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
