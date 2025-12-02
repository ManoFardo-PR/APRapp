import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { UserPlus, Edit, Loader2, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

type UserRole = "company_admin" | "safety_tech" | "requester";
type Language = "pt-BR" | "en-US";

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Form states
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    role: "requester" as UserRole,
    language: "pt-BR" as Language,
  });

  // Queries
  const { data: users = [], isLoading, refetch } = trpc.users.listCompanyUsers.useQuery();
  const { data: stats } = trpc.users.stats.useQuery();

  // Mutations
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário adicionado com sucesso!");
      setShowAddDialog(false);
      setNewUser({ email: "", name: "", role: "requester", language: "pt-BR" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar usuário");
    },
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      setEditingUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar usuário");
    },
  });

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.name) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    createMutation.mutate(newUser);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateMutation.mutate({
      userId: editingUser.id,
      role: editingUser.role,
      language: editingUser.language,
      isActive: editingUser.isActive,
    });
  };

  const handleToggleActive = (user: any) => {
    updateMutation.mutate({
      userId: user.id,
      isActive: !user.isActive,
    });
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      company_admin: <Badge className="bg-blue-500">Administrador</Badge>,
      safety_tech: <Badge className="bg-green-500">Técnico de Segurança</Badge>,
      requester: <Badge className="bg-purple-500">Solicitante</Badge>,
    };
    return badges[role as keyof typeof badges] || <Badge>{role}</Badge>;
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      company_admin: "Gerencia usuários e configurações da empresa",
      safety_tech: "Aprova e rejeita APRs, visualiza relatórios",
      requester: "Cria e visualiza suas próprias APRs",
    };
    return descriptions[role as keyof typeof descriptions] || "";
  };

  const limitReached = stats && stats.activeUsers >= stats.userLimit;

  return (
    <div className="container py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Usuários</h1>
        <p className="text-gray-600">Gerencie os usuários da sua empresa</p>
      </div>

      {/* Stats Card */}
      {stats && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeUsers} / {stats.userLimit}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <Progress value={stats.percentageUsed} className="h-2" />
          <p className="text-xs text-gray-500 mt-2">{stats.percentageUsed}% do limite utilizado</p>
        </div>
      )}

      {/* Limit Warning */}
      {limitReached && (
        <Alert className="mb-6 border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Limite de usuários atingido ({stats?.activeUsers}/{stats?.userLimit}). Contate o
            superadmin para aumentar o limite.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Add Button */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <Label htmlFor="role-filter">Perfil</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="company_admin">Administradores</SelectItem>
                <SelectItem value="safety_tech">Técnicos</SelectItem>
                <SelectItem value="requester">Solicitantes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button disabled={limitReached} className="w-full md:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo usuário. Um link de acesso será gerado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="usuario@empresa.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-name">Nome Completo *</Label>
                  <Input
                    id="new-name"
                    placeholder="João da Silva"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="new-role">Perfil *</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger id="new-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requester">
                        <div>
                          <p className="font-medium">Solicitante</p>
                          <p className="text-xs text-gray-500">Cria e visualiza suas próprias APRs</p>
                        </div>
                      </SelectItem>
                      <SelectItem value="safety_tech">
                        <div>
                          <p className="font-medium">Técnico de Segurança</p>
                          <p className="text-xs text-gray-500">Aprova e rejeita APRs</p>
                        </div>
                      </SelectItem>
                      <SelectItem value="company_admin">
                        <div>
                          <p className="font-medium">Administrador</p>
                          <p className="text-xs text-gray-500">Gerencia usuários e configurações</p>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">{getRoleDescription(newUser.role)}</p>
                </div>
                <div>
                  <Label htmlFor="new-language">Idioma</Label>
                  <Select
                    value={newUser.language}
                    onValueChange={(value) => setNewUser({ ...newUser, language: value as Language })}
                  >
                    <SelectTrigger id="new-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (BR)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Adicionar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleActive(user)}
                        disabled={updateMutation.isPending}
                      />
                      <span className="text-sm text-gray-600">
                        {user.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {user.lastSignedIn
                      ? new Date(user.lastSignedIn).toLocaleString("pt-BR")
                      : "Nunca"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog
                      open={editingUser?.id === user.id}
                      onOpenChange={(open) => !open && setEditingUser(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser({ ...user })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                          <DialogDescription>
                            Atualize as informações do usuário
                          </DialogDescription>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Email</Label>
                              <Input value={editingUser.email || ""} disabled className="bg-gray-50" />
                              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                            </div>
                            <div>
                              <Label htmlFor="edit-name">Nome Completo</Label>
                              <Input
                                id="edit-name"
                                value={editingUser.name || ""}
                                onChange={(e) =>
                                  setEditingUser({ ...editingUser, name: e.target.value })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-role">Perfil</Label>
                              <Select
                                value={editingUser.role}
                                onValueChange={(value) =>
                                  setEditingUser({ ...editingUser, role: value })
                                }
                              >
                                <SelectTrigger id="edit-role">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="requester">Solicitante</SelectItem>
                                  <SelectItem value="safety_tech">Técnico de Segurança</SelectItem>
                                  <SelectItem value="company_admin">Administrador</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="edit-language">Idioma</Label>
                              <Select
                                value={editingUser.language}
                                onValueChange={(value) =>
                                  setEditingUser({ ...editingUser, language: value })
                                }
                              >
                                <SelectTrigger id="edit-language">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                                  <SelectItem value="en-US">English (US)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={editingUser.isActive}
                                onCheckedChange={(checked) =>
                                  setEditingUser({ ...editingUser, isActive: checked })
                                }
                              />
                              <Label>Usuário ativo</Label>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Criado em: {new Date(editingUser.createdAt).toLocaleString("pt-BR")}</p>
                              <p>
                                Último acesso:{" "}
                                {editingUser.lastSignedIn
                                  ? new Date(editingUser.lastSignedIn).toLocaleString("pt-BR")
                                  : "Nunca"}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setEditingUser(null)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleUpdateUser}
                            disabled={updateMutation.isPending}
                            className="flex-1"
                          >
                            {updateMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Salvar Alterações
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
