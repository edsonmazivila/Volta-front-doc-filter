import { getOrganizationDocuments } from '@/lib/services/organization-data';
import { getAllCompanies } from '@/lib/services/companies';
import { Card } from '@/components/dashboard/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DocumentsFilters } from '@/components/organization/documents-filters';

export default async function OrganizationDocumentsPage({
  searchParams
}: {
  searchParams: Promise<{ company?: string; status?: string }>;
}) {
  const params = await searchParams;
  const companyId = params.company;
  const status = params.status;

  const [documentsResult, companiesResult] = await Promise.all([
    getOrganizationDocuments({ company_id: companyId, status }),
    getAllCompanies()
  ]);

  const documents = documentsResult.data;
  const companies = companiesResult.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Employee Documents</h1>
      </div>

      {/* Summary Card */}
      <Card>
        <p className="text-sm text-muted-foreground">Total Documents</p>
        <div className="text-2xl font-bold mt-2">{documents.length}</div>
      </Card>

      {/* Filters */}
      <Card>
        <DocumentsFilters companies={companies} />
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Document Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No documents available
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.company_name}</TableCell>
                  <TableCell>{doc.employee_name || '-'}</TableCell>
                  <TableCell>{doc.document_name}</TableCell>
                  <TableCell>{doc.document_type}</TableCell>
                  <TableCell>{new Date(doc.upload_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
