import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";
import { FileText, Clock, CheckCircle, XCircle, Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  // Redirect superadmin to dedicated dashboard
  if (user && user.role === "superadmin") {
    setLocation("/admin/dashboard");
    return null;
  }
  const { data: stats, isLoading: statsLoading } = trpc.aprs.getStats.useQuery();
  const { data: myAprs, isLoading: aprsLoading } = trpc.aprs.list.useQuery({ 
    userId: user?.id 
  });

  if (!user) {
    return (
      <div className="container py-8">
        <p>{t("auth.not_logged_in")}</p>
      </div>
    );
  }

  const isRequester = user.role === "requester";
  const isSafetyTech = user.role === "safety_tech";
  const isAdmin = user.role === "company_admin" || user.role === "superadmin";

  return (
    <div className="container py-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.welcome")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("auth.welcome")}, {user.name}
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.total_aprs")}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.pending")}
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.approved")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("stats.rejected")}
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("nav.dashboard")}</CardTitle>
          <CardDescription>
            {isRequester && "Crie e gerencie suas APRs"}
            {isSafetyTech && "Aprove e revise APRs pendentes"}
            {isAdmin && "Gerencie usuários e visualize estatísticas"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRequester && (
            <Link href="/aprs/new">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                {t("apr.new")}
              </Button>
            </Link>
          )}

          {isSafetyTech && (
            <Link href="/aprs/pending">
              <Button className="w-full" size="lg" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                {t("dashboard.pending_approval")}
              </Button>
            </Link>
          )}

          {isAdmin && (
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/users">
                <Button className="w-full" variant="outline">
                  {t("nav.users")}
                </Button>
              </Link>
              <Link href="/statistics">
                <Button className="w-full" variant="outline">
                  {t("nav.statistics")}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent APRs */}
      {myAprs && myAprs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recent_aprs")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myAprs.slice(0, 5).map((apr) => (
                <Link key={apr.id} href={`/aprs/${apr.id}`}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <p className="font-medium">{apr.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(apr.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        apr.status === "approved" ? "bg-green-100 text-green-800" :
                        apr.status === "rejected" ? "bg-red-100 text-red-800" :
                        apr.status === "pending_approval" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {t(`status.${apr.status}`)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
