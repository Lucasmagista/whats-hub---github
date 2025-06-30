import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Tag, 
  Clock,
  Star,
  MoreVertical,
  Filter,
  BookOpen,
  Zap
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import VisuallyHidden from '@/components/ui/VisuallyHidden';
import { dataStore, QuickReplyTemplate } from '@/store/dataStore';

interface NewTemplateForm {
  title: string;
  content: string;
  category: string;
  tags: string;
}

const QuickReplyTemplates = () => {
  const [templates, setTemplates] = useState<QuickReplyTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QuickReplyTemplate | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [newTemplateForm, setNewTemplateForm] = useState<NewTemplateForm>({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const categories = ['Saudações', 'Pedidos', 'Coleta de Dados', 'Despedidas', 'Suporte Técnico', 'Informações', 'Promoções', 'FAQ'];

  // Load templates from dataStore on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const storedTemplates = dataStore.getQuickReplyTemplates();
    setTemplates(storedTemplates);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  const handleCreateTemplate = () => {
    const newTemplate = dataStore.addQuickReplyTemplate({
      title: newTemplateForm.title,
      content: newTemplateForm.content,
      category: newTemplateForm.category,
      tags: newTemplateForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    
    loadTemplates(); // Reload templates from dataStore
    setNewTemplateForm({
      title: '',
      content: '',
      category: '',
      tags: ''
    });
    setIsNewTemplateOpen(false);
  };

  const handleEditTemplate = (template: QuickReplyTemplate) => {
    setEditingTemplate(template);
    setNewTemplateForm({
      title: template.title,
      content: template.content,
      category: template.category,
      tags: template.tags.join(', ')
    });
    setIsEditOpen(true);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;
    
    dataStore.updateQuickReplyTemplate(editingTemplate.id, {
      title: newTemplateForm.title,
      content: newTemplateForm.content,
      category: newTemplateForm.category,
      tags: newTemplateForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });
    
    loadTemplates(); // Reload templates from dataStore
    setIsEditOpen(false);
    setEditingTemplate(null);
    setNewTemplateForm({
      title: '',
      content: '',
      category: '',
      tags: ''
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    dataStore.deleteQuickReplyTemplate(templateId);
    loadTemplates(); // Reload templates from dataStore
  };

  const handleToggleFavorite = (templateId: string) => {
    dataStore.toggleQuickReplyTemplateFavorite(templateId);
    loadTemplates(); // Reload templates from dataStore
  };

  const handleUseTemplate = (templateId: string) => {
    dataStore.useQuickReplyTemplate(templateId);
    loadTemplates(); // Reload templates from dataStore
    
    // Aqui você pode adicionar lógica para inserir o template no chat
    console.log('Template usado:', templateId);
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Nunca usado';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Saudações': return '👋';
      case 'Pedidos': return '📦';
      case 'Coleta de Dados': return '📋';
      case 'Despedidas': return '👋';
      case 'Suporte Técnico': return '🔧';
      case 'Informações': return 'ℹ️';
      case 'Promoções': return '🎉';
      case 'FAQ': return '❓';
      default: return '💬';
    }
  };
  return (
    <Card className="h-full glass-card border-0 ticket-manager-compact">
      <CardHeader className="pb-2 px-3 pt-3 card-header flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            Templates de Respostas Rápidas
          </CardTitle>
          
          <div className="flex items-center gap-3">
            {/* Estatísticas rápidas */}
            <div className="hidden lg:flex items-center gap-3 text-xs">
              <div className="text-center bg-blue-50 px-2 py-1 rounded border">
                <div className="text-lg font-bold text-blue-600">{templates.length}</div>
                <div className="text-[10px] text-gray-500">Templates</div>
              </div>
              <div className="text-center bg-green-50 px-2 py-1 rounded border">
                <div className="text-lg font-bold text-green-600">{templates.filter(t => t.isFavorite).length}</div>
                <div className="text-[10px] text-gray-500">Favoritos</div>
              </div>
              <div className="text-center bg-purple-50 px-2 py-1 rounded border">
                <div className="text-lg font-bold text-purple-600">{templates.reduce((acc, t) => acc + t.usageCount, 0)}</div>
                <div className="text-[10px] text-gray-500">Usos</div>
              </div>
            </div>
            
            {/* Ações rápidas */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="text-xs h-7 px-2 border-gray-200 hover:bg-gray-50"
                title="Limpar filtros"
              >
                🔄
              </Button>

              <Dialog open={isNewTemplateOpen} onOpenChange={setIsNewTemplateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700 text-white h-7 px-2 text-xs">
                    <Plus className="h-3 w-3" />
                    Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <VisuallyHidden>
                    <DialogTitle>Templates de Resposta Rápida</DialogTitle>
                    <DialogDescription>Modal para criar ou editar templates de resposta rápida.</DialogDescription>
                  </VisuallyHidden>
                  {/* Conteúdo do modal permanece igual */}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Filtros e Busca */}
        <div className="bg-gray-50 p-2 rounded-lg border">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Buscar templates por título, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-xs bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>
            
            <div className="flex gap-1">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px] h-7 text-xs bg-white border-gray-200">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryIcon(cat)} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Estatísticas dos filtros */}
          <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredTemplates.length}</span> templates encontrados
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-blue-600">📝 {filteredTemplates.length} disponíveis</span>
              <span className="text-yellow-600">⭐ {filteredTemplates.filter(t => t.isFavorite).length} favoritos</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col card-content overflow-hidden">
        <div className="px-3 pb-3 flex-1 flex flex-col min-h-0 overflow-hidden">
          <ScrollArea className="flex-1 mt-2 scroll-area custom-scroll overflow-y-auto template-scroll-area">
            <div className="space-y-2">              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium mb-2">Nenhum template encontrado</p>
                  <p className="text-sm">
                    {templates.length === 0 
                      ? 'Crie seu primeiro template de resposta rápida usando o botão "Novo" acima'
                      : 'Tente ajustar os filtros ou criar um novo template'
                    }
                  </p>
                </div>
              ) : (
                filteredTemplates.map(template => (
                  <div 
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all duration-200 ticket-card-compact"
                  >
                    <div className="p-3">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{getCategoryIcon(template.category)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm leading-tight truncate">
                              {template.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                {template.category}
                              </Badge>
                              {template.isFavorite && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleFavorite(template.id)}
                                  className="h-6 w-6 p-0 hover:bg-yellow-50"
                                >
                                  <Star className={`h-3 w-3 ${template.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {template.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyTemplate(template.content)}
                                  className="h-6 w-6 p-0 hover:bg-blue-50"
                                >
                                  <Copy className="h-3 w-3 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Copiar conteúdo
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditTemplate(template)}
                                  className="h-6 w-6 p-0 hover:bg-green-50"
                                >
                                  <Edit3 className="h-3 w-3 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Editar template
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Tem certeza que deseja excluir este template?')) {
                                      handleDeleteTemplate(template.id);
                                    }
                                  }}
                                  className="h-6 w-6 p-0 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Excluir template
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      {/* Conteúdo */}
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-blue-300 leading-relaxed">
                          {template.content.length > 120 
                            ? `${template.content.substring(0, 120)}...` 
                            : template.content}
                        </p>
                      </div>

                      {/* Tags */}
                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {template.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0.5 text-gray-600">
                              <Tag className="h-2 w-2 mr-0.5" />
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-1 py-0.5 text-gray-500">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDate(template.lastUsed)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5" />
                            {template.usageCount} usos
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template.id)}
                          className="text-xs h-6 px-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <MessageSquare className="h-2.5 w-2.5 mr-1" />
                          Usar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickReplyTemplates;