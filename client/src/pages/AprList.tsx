import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Plus, FileText, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AprList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: aprs, isLoading } = trpc.aprs.list.useQuery({ 
    status: statusFilter as any 
  });

  if (!user) {
    return (
      <div className="container py-8">
        <p>{t("auth.not_logged_in")}</p>
      </div>
    );
  }

  const canCreate = user.role === "requester" || user.role === "company_admin" || user.role === "superadmin";

  return (
    <div className="container py-8 space-y-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/dashboard'}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("nav.aprs")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("apr.title")}
          </p>
        </div>
        {canCreate && (
          <Link href="/aprs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("apr.new")}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.filter")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("apr.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">{t("status.draft")}</SelectItem>
                <SelectItem value="pending_approval">{t("status.pending_approval")}</SelectItem>
                <SelectItem value="approved">{t("status.approved")}</SelectItem>
                <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* APR List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p>{t("common.loading")}</p>
        </div>
      ) : aprs && aprs.length > 0 ? (
        <div className="grid gap-4">
          {aprs.map((apr) => (
            <Link key={apr.id} href={`/aprs/${apr.id}`}>
              <Card className="hover:bg-accent cursor-pointer transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{apr.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {apr.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{t("apr.location")}: {apr.location || "N/A"}</span>
                          <span>•</span>
                          <span>{new Date(apr.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apr.status === "approved" ? "bg-green-100 text-green-800" :
                        apr.status === "rejected" ? "bg-red-100 text-red-800" :
                        apr.status === "pending_approval" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {t(`status.${apr.status}`)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma APR encontrada
            </p>
            {canCreate && (
              <Link href="/aprs/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("apr.new")}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
