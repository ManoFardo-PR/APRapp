import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Users, Shield, Plus, Edit, CheckCircle, XCircle, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Form states
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyMaxUsers, setNewCompanyMaxUsers] = useState(10);
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  // Queries
  const { data: companies, isLoading, refetch } = trpc.companies.list.useQuery();
  
  // Query for admin emails (only when company is expanded)
  const { data: adminEmails, refetch: refetchAdminEmails } = trpc.companies.getAdminEmails.useQuery(
    { companyId: expandedCompanyId || 0 },
    { enabled: !!expandedCompanyId }
  );

  // Mutations
  const createCompanyMutation = trpc.companies.create.useMutation({
    onSuccess: () => {
      toast.success("Empresa criada com sucesso!");
      setShowCreateDialog(false);
      setNewCompanyCode("");
      setNewCompanyName("");
      setNewCompanyMaxUsers(10);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const addAdminEmailMutation = trpc.companies.addAdminEmail.useMutation({
    onSuccess: () => {
      toast.success("Email de admin adicionado com sucesso!");
      setNewAdminEmail("");
      refetchAdminEmails();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const removeAdminEmailMutation = trpc.companies.removeAdminEmail.useMutation({
    onSuccess: () => {
      toast.success("Email de admin removido com sucesso!");
      refetchAdminEmails();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateCompanyMutation = trpc.companies.update.useMutation({
    onSuccess: () => {
      toast.success("Empresa atualizada com sucesso!");
      setShowEditDialog(false);
      setSelectedCompany(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateCompany = () => {
    if (!newCompanyCode.trim() || !newCompanyName.trim()) {
      toast.error("Código e nome são obrigatórios");
      return;
    }

    createCompanyMutation.mutate({
      code: newCompanyCode.trim().toUpperCase(),
      name: newCompanyName.trim(),
      maxUsers: newCompanyMaxUsers,
    });
  };

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
    setShowEditDialog(true);
  };

  const handleUpdateCompany = () => {
    if (!selectedCompany) return;

    updateCompanyMutation.mutate({
      id: selectedCompany.id,
      name: selectedCompany.name,
      maxUsers: selectedCompany.maxUsers,
      isActive: selectedCompany.isActive,
    });
  };

  const handleToggleActive = (companyId: number, currentStatus: boolean) => {
    updateCompanyMutation.mutate({
      id: companyId,
      isActive: !currentStatus,
    });
  };

  const handleAddAdminEmail = (companyId: number) => {
    if (!newAdminEmail.trim()) {
      toast.error("Digite um email válido");
      return;
    }

    addAdminEmailMutation.mutate({
      companyId,
      email: newAdminEmail.trim(),
    });
  };

  const handleRemoveAdminEmail = (emailId: number, companyId: number) => {
    if (confirm("Tem certeza que deseja remover este email de admin?")) {
      removeAdminEmailMutation.mutate({
        id: emailId,
        companyId,
      });
    }
  };

  const toggleCompanyExpand = (companyId: number) => {
    setExpandedCompanyId(expandedCompanyId === companyId ? null : companyId);
  };

  if (!user || user.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Você não tem permissão para acessar esta página</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              Voltar à Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">APRFix - Superadmin</h1>
              <p className="text-sm text-muted-foreground">{user.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={async () => {
            await logout();
            window.location.href = '/';
          }}>
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies?.filter(c => c.isActive).length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {companies?.reduce((sum, c) => sum + (c.userCount || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestão de Empresas</CardTitle>
                <CardDescription>Crie e gerencie empresas cadastradas no sistema</CardDescription>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Empresa</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Código da Empresa *</Label>
                      <Input
                        id="code"
                        placeholder="Ex: COLORFIX"
                        value={newCompanyCode}
                        onChange={(e) => setNewCompanyCode(e.target.value.toUpperCase())}
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground">
                        Código único usado para acesso (será convertido para maiúsculas)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Nome da Empresa *</Label>
                      <Input
                        id="name"
                        placeholder="Ex: Colorfix Indústria"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxUsers">Limite de Usuários</Label>
                      <Input
                        id="maxUsers"
                        type="number"
                        min={1}
                        value={newCompanyMaxUsers}
                        onChange={(e) => setNewCompanyMaxUsers(parseInt(e.target.value) || 10)}
                      />
                    </div>

                    <Button
                      onClick={handleCreateCompany}
                      disabled={createCompanyMutation.isPending}
                      className="w-full"
                    >
                      {createCompanyMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Criar Empresa"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando empresas...</p>
              </div>
            ) : companies && companies.length > 0 ? (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="border rounded-lg overflow-hidden">
                    {/* Company Header */}
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{company.name}</h3>
                            {company.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                <CheckCircle className="h-3 w-3" />
                                Ativa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                <XCircle className="h-3 w-3" />
                                Inativa
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Código: <span className="font-mono font-semibold">{company.code}</span> • 
                            Usuários: {company.userCount || 0}/{company.maxUsers}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCompany(company)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/empresa/${company.code}`, '_blank')}
                        >
                          Ver Landing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCompanyExpand(company.id)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Admins
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Section - Admin Emails */}
                    {expandedCompanyId === company.id && (
                      <div className="border-t bg-gray-50 p-4 space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Emails de Administradores
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Quando um usuário com um desses emails fizer login, será automaticamente associado como admin desta empresa.
                          </p>

                          {/* Add Email Form */}
                          <div className="flex gap-2 mb-3">
                            <Input
                              type="email"
                              placeholder="email@empresa.com"
                              value={newAdminEmail}
                              onChange={(e) => setNewAdminEmail(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddAdminEmail(company.id);
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddAdminEmail(company.id)}
                              disabled={addAdminEmailMutation.isPending}
                            >
                              {addAdminEmailMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                          </div>

                          {/* Email List */}
                          {adminEmails && adminEmails.length > 0 ? (
                            <div className="space-y-2">
                              {adminEmails.map((adminEmail: any) => (
                                <div
                                  key={adminEmail.id}
                                  className="flex items-center justify-between p-2 bg-white border rounded">
                                  <span className="text-sm font-mono">{adminEmail.email}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAdminEmail(adminEmail.id, company.id)}
                                    disabled={removeAdminEmailMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhum email de admin configurado
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma empresa cadastrada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira empresa para começar
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Empresa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Company Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Empresa</DialogTitle>
            </DialogHeader>
            {selectedCompany && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Código da Empresa</Label>
                  <Input value={selectedCompany.code} disabled />
                  <p className="text-xs text-muted-foreground">
                    O código não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da Empresa</Label>
                  <Input
                    id="edit-name"
                    value={selectedCompany.name}
                    onChange={(e) =>
                      setSelectedCompany({ ...selectedCompany, name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-maxUsers">Limite de Usuários</Label>
                  <Input
                    id="edit-maxUsers"
                    type="number"
                    min={1}
                    value={selectedCompany.maxUsers}
                    onChange={(e) =>
                      setSelectedCompany({
                        ...selectedCompany,
                        maxUsers: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-active">Empresa Ativa</Label>
                  <Switch
                    id="edit-active"
                    checked={selectedCompany.isActive}
                    onCheckedChange={(checked) =>
                      setSelectedCompany({ ...selectedCompany, isActive: checked })
                    }
                  />
                </div>

                <Button
                  onClick={handleUpdateCompany}
                  disabled={updateCompanyMutation.isPending}
                  className="w-full"
                >
                  {updateCompanyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
