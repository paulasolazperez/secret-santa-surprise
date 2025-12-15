import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Snowfall from '@/components/Snowfall';
import { Gift, Plus, Users, LogOut, Sparkles, Copy, Shuffle, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Group {
  id: string;
  name: string;
  code: string;
  created_by: string;
  is_drawn: boolean;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  assigned_to: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [myAssignment, setMyAssignment] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const groupIds = memberData.map(m => m.group_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);
      } else {
        setGroups([]);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Error al cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) return;

    try {
      const code = generateCode();
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          code,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      await supabase.from('group_members').insert({
        group_id: groupData.id,
        user_id: user.id,
        user_email: user.email || '',
        user_name: profileData?.display_name || user.email?.split('@')[0] || 'Usuario',
      });

      toast.success(`¡Grupo creado! Código: ${code}`);
      setNewGroupName('');
      setCreateDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Error al crear el grupo');
    }
  };

  const joinGroup = async () => {
    if (!user || !joinCode.trim()) return;

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('code', joinCode.trim().toUpperCase())
        .single();

      if (groupError || !groupData) {
        toast.error('Código de grupo no válido');
        return;
      }

      const { data: existingMember } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast.error('Ya eres miembro de este grupo');
        return;
      }

      if (groupData.is_drawn) {
        toast.error('El sorteo ya se ha realizado en este grupo');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      await supabase.from('group_members').insert({
        group_id: groupData.id,
        user_id: user.id,
        user_email: user.email || '',
        user_name: profileData?.display_name || user.email?.split('@')[0] || 'Usuario',
      });

      toast.success(`¡Te has unido a "${groupData.name}"!`);
      setJoinCode('');
      setJoinDialogOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Error al unirse al grupo');
    }
  };

  const openGroupDetails = async (group: Group) => {
    setSelectedGroup(group);
    setMyAssignment(null);

    try {
      const { data: membersData, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id);

      if (error) throw error;
      setGroupMembers(membersData || []);

      const userIds = membersData?.map(m => m.user_id) || [];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        const profilesMap: Record<string, Profile> = {};
        profilesData?.forEach(p => {
          profilesMap[p.user_id] = p;
        });
        setProfiles(profilesMap);
      }

      if (group.is_drawn && user) {
        const myMember = membersData?.find(m => m.user_id === user.id);
        if (myMember?.assigned_to) {
          const { data: assignedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', myMember.assigned_to)
            .single();
          setMyAssignment(assignedProfile || null);
        }
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const performDraw = async () => {
    if (!selectedGroup || !user) return;
    
    if (selectedGroup.created_by !== user.id) {
      toast.error('Solo el creador del grupo puede realizar el sorteo');
      return;
    }

    if (groupMembers.length < 3) {
      toast.error('Se necesitan al menos 3 participantes para el sorteo');
      return;
    }

    try {
      const shuffled = [...groupMembers].sort(() => Math.random() - 0.5);
      const assignments: { id: string; assigned_to: string }[] = [];

      for (let i = 0; i < shuffled.length; i++) {
        const giver = shuffled[i];
        const receiver = shuffled[(i + 1) % shuffled.length];
        assignments.push({ id: giver.id, assigned_to: receiver.user_id });
      }

      for (const assignment of assignments) {
        await supabase
          .from('group_members')
          .update({ assigned_to: assignment.assigned_to })
          .eq('id', assignment.id);
      }

      await supabase
        .from('groups')
        .update({ is_drawn: true })
        .eq('id', selectedGroup.id);

      toast.success('¡Sorteo realizado con éxito! Cada participante puede ver su asignación.');
      
      const updatedGroup = { ...selectedGroup, is_drawn: true };
      setSelectedGroup(updatedGroup);
      setGroups(groups.map(g => g.id === selectedGroup.id ? updatedGroup : g));
      openGroupDetails(updatedGroup);
    } catch (error) {
      console.error('Error performing draw:', error);
      toast.error('Error al realizar el sorteo');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado al portapapeles');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Snowfall />
        <div className="text-primary animate-pulse text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <Snowfall />
      <div className="absolute inset-0 bg-gradient-festive opacity-30" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Gift className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-display text-gradient-gold">Amigo Invisible</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              Hola, <span className="text-foreground">{user?.email?.split('@')[0]}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-4 mb-8">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Crear grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/30">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-gradient-gold">Crear nuevo grupo</DialogTitle>
                <DialogDescription>Crea un grupo e invita a tus amigos con el código</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Nombre del grupo</Label>
                  <Input
                    placeholder="Ej: Amigos del trabajo"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <Button variant="gold" className="w-full" onClick={createGroup}>
                  Crear grupo
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Users className="w-5 h-5 mr-2" />
                Unirse a grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-primary/30">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl text-gradient-gold">Unirse a un grupo</DialogTitle>
                <DialogDescription>Introduce el código que te han compartido</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Código del grupo</Label>
                  <Input
                    placeholder="Ej: ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                </div>
                <Button variant="gold" className="w-full" onClick={joinGroup}>
                  Unirse
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {groups.length === 0 ? (
          <Card className="text-center py-12 glow-gold border-primary/20">
            <CardContent>
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4 animate-twinkle" />
              <h2 className="text-xl font-display text-foreground mb-2">¡Aún no tienes grupos!</h2>
              <p className="text-muted-foreground">Crea uno nuevo o únete con un código</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {groups.map((group) => (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:border-primary/50 hover:glow-gold transition-all duration-300"
                onClick={() => openGroupDetails(group)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    {group.is_drawn && (
                      <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                        Sorteado
                      </span>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <span>Código:</span>
                    <code className="bg-muted px-2 py-1 rounded text-primary font-mono">{group.code}</code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCode(group.code);
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
          <DialogContent className="bg-card border-primary/30 max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-gradient-gold">
                {selectedGroup?.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <span>Código:</span>
                <code className="bg-muted px-2 py-1 rounded text-primary font-mono">{selectedGroup?.code}</code>
                <button
                  onClick={() => selectedGroup && copyCode(selectedGroup.code)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Participantes ({groupMembers.length})
                </h3>
                <div className="space-y-2">
                  {groupMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 bg-muted/50 px-3 py-2 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                        {member.user_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-foreground">{member.user_name}</span>
                      {member.user_id === selectedGroup?.created_by && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full ml-auto">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedGroup?.is_drawn && myAssignment && (
                <Card className="bg-gradient-to-br from-secondary/20 to-accent/20 border-primary/30 glow-burgundy">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Gift className="w-5 h-5 text-primary" />
                      Tu amigo invisible es:
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-display text-gradient-gold animate-float">
                      {myAssignment.display_name}
                    </p>
                  </CardContent>
                </Card>
              )}

              {!selectedGroup?.is_drawn && selectedGroup?.created_by === user?.id && (
                <Button 
                  variant="festive" 
                  size="lg" 
                  className="w-full"
                  onClick={performDraw}
                  disabled={groupMembers.length < 3}
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Realizar sorteo
                </Button>
              )}

              {!selectedGroup?.is_drawn && selectedGroup?.created_by !== user?.id && (
                <p className="text-center text-muted-foreground text-sm">
                  Esperando a que el administrador realice el sorteo...
                </p>
              )}

              {groupMembers.length < 3 && !selectedGroup?.is_drawn && (
                <p className="text-center text-muted-foreground text-sm">
                  Se necesitan al menos 3 participantes para el sorteo
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
