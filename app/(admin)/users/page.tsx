'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import api from '@/lib/api';
import { PageResponse, Role, UpdateRoleData, User } from '@/types/auth';
import { AxiosError } from 'axios';

const ALL_ROLES: Role[] = ['ROLE_CREATOR', 'ROLE_AGENT', 'ROLE_ADMIN'];

const roleLabels: Record<Role, string> = {
  ROLE_ADMIN: 'Admin',
  ROLE_CLIENT: 'Client',
  ROLE_CREATOR: 'Créateur',
  ROLE_AGENT: 'Agent',
};

interface UserRow extends User {
  enabled: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, hasRole, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Role edit modal state
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Toggle confirmation state
  const [confirmToggle, setConfirmToggle] = useState<UserRow | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const fetchUsers = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<PageResponse<UserRow>>('/api/admin/users', {
        params: { page, size: 10, sort: 'createdAt,desc' },
      });
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || !hasRole('ROLE_ADMIN')) {
        router.push('/dashboard');
        return;
      }
      fetchUsers(currentPage);
    }
  }, [authLoading, currentUser, hasRole, router, fetchUsers, currentPage]);

  const openEditModal = (userRow: UserRow) => {
    setEditingUser(userRow);
    setSelectedRoles([...userRow.roles]);
    setRoleError(null);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setSelectedRoles([]);
    setRoleError(null);
  };

  const toggleRoleSelection = (role: Role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    if (selectedRoles.length === 0) {
      setRoleError('Au moins un rôle est requis.');
      return;
    }
    setIsSavingRoles(true);
    setRoleError(null);
    try {
      const body: UpdateRoleData = { roles: selectedRoles };
      await api.put(`/api/admin/users/${editingUser.id}/roles`, body);
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, roles: selectedRoles } : u))
      );
      closeEditModal();
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setRoleError(axiosError.response?.data?.message || 'Erreur lors de la mise à jour des rôles.');
    } finally {
      setIsSavingRoles(false);
    }
  };

  const handleToggleEnabled = async () => {
    if (!confirmToggle) return;
    setIsToggling(true);
    try {
      if (confirmToggle.enabled) {
        await api.delete(`/api/admin/users/${confirmToggle.id}`);
      } else {
        await api.post(`/api/admin/users/${confirmToggle.id}/enable`);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === confirmToggle.id ? { ...u, enabled: !confirmToggle.enabled } : u
        )
      );
      setConfirmToggle(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Erreur lors de la modification du statut.');
      setConfirmToggle(null);
    } finally {
      setIsToggling(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              NP
            </div>
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <a href="/dashboard" className="hover:text-gray-900 transition">Dashboard</a>
              <span>/</span>
              <span className="text-gray-900 font-medium">Utilisateurs</span>
            </nav>
          </div>
          <span className="text-xs font-medium bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
            Administration
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-1">
            {totalElements} utilisateur{totalElements !== 1 ? 's' : ''} au total
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p>Aucun utilisateur trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Rôles
                    </th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-right px-6 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((userRow) => (
                    <tr key={userRow.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={userRow.fullName} avatarUrl={userRow.avatarUrl} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{userRow.fullName}</p>
                            {userRow.emailVerified && (
                              <span className="text-xs text-green-600">Email vérifié</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{userRow.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {userRow.roles.map((role) => (
                            <Badge key={role} role={role as Role} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            userRow.enabled
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              userRow.enabled ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          {userRow.enabled ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(userRow)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition font-medium"
                          >
                            Modifier rôles
                          </button>
                          <button
                            onClick={() => setConfirmToggle(userRow)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                              userRow.enabled
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {userRow.enabled ? 'Désactiver' : 'Réactiver'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {currentPage + 1} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Role edit modal */}
      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 id="modal-title" className="text-lg font-bold text-gray-900 mb-1">
              Modifier les rôles
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {editingUser.fullName} — {editingUser.email}
            </p>

            {roleError && (
              <div className="mb-4">
                <ErrorAlert message={roleError} onDismiss={() => setRoleError(null)} />
              </div>
            )}

            <div className="space-y-2 mb-6">
              {ALL_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRoleSelection(role)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{roleLabels[role]}</span>
                  <Badge role={role} />
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeEditModal}
                disabled={isSavingRoles}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={isSavingRoles}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center justify-center gap-2"
              >
                {isSavingRoles ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle confirmation modal */}
      {confirmToggle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 id="confirm-title" className="text-lg font-bold text-gray-900 mb-2">
              {confirmToggle.enabled ? 'Désactiver le compte' : 'Réactiver le compte'}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {confirmToggle.enabled
                ? `Voulez-vous désactiver le compte de ${confirmToggle.fullName} ? L'utilisateur ne pourra plus se connecter.`
                : `Voulez-vous réactiver le compte de ${confirmToggle.fullName} ?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                disabled={isToggling}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleToggleEnabled}
                disabled={isToggling}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2 ${
                  confirmToggle.enabled
                    ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                }`}
              >
                {isToggling ? (
                  <>
                    <LoadingSpinner size="sm" />
                    En cours...
                  </>
                ) : confirmToggle.enabled ? (
                  'Désactiver'
                ) : (
                  'Réactiver'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
