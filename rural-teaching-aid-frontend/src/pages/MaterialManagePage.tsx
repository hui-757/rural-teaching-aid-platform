import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/useAuthStore'
import type { Material, Unit } from '../types'
import { ScrollPanel } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import {
  Upload, FileText, Image, FolderOpen, ChevronLeft, Loader2,
  Trash2, Move, ExternalLink, X, AlertTriangle
} from 'lucide-react'

export default function MaterialManagePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [materials, setMaterials] = useState<Material[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'pdf' | 'image_group' | null>(null)
  const [groupName, setGroupName] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      fetchMaterials()
      fetchUnits()
    }
  }, [user])

  const fetchMaterials = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('material')
      .select('*')
      .eq('teacher_id', user!.id)
      .order('created_at', { ascending: false })
    if (data) setMaterials(data as Material[])
    setLoading(false)
  }

  const fetchUnits = async () => {
    const { data } = await supabase.from('unit').select('*').order('unit_id')
    if (data) setUnits(data as Unit[])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Word 检测
    const wordFiles = files.filter(f =>
      f.name.endsWith('.doc') || f.name.endsWith('.docx')
    )
    if (wordFiles.length > 0) {
      setError('检测到 Word 文件，请先将其转为 PDF 后上传。')
      return
    }

    if (uploadType === 'pdf') {
      if (files.length > 1) {
        setError('PDF 模式每次只能上传一个文件，请使用图片组模式上传多张图片。')
        return
      }
      if (!files[0].name.endsWith('.pdf')) {
        setError('请上传 PDF 文件，或切换到图片组模式。')
        return
      }
    } else if (uploadType === 'image_group') {
      const nonImg = files.filter(f => !f.type.startsWith('image/'))
      if (nonImg.length > 0) {
        setError('图片组模式仅支持图片文件。')
        return
      }
    }

    setSelectedFiles(files)
  }

  const handleUpload = async () => {
    if (!user) return
    if (!groupName.trim()) {
      setError('请输入分组名称')
      return
    }
    if (selectedFiles.length === 0) {
      setError('请选择要上传的文件')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploadedUrls: string[] = []
      for (const file of selectedFiles) {
        const timestamp = Date.now()
        const safeName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const path = `${user.id}/${safeName}`

        const { error: upError } = await supabase.storage
          .from('materials')
          .upload(path, file, { upsert: false })

        if (upError) throw upError

        const { data: publicUrlData } = supabase.storage
          .from('materials')
          .getPublicUrl(path)

        uploadedUrls.push(publicUrlData.publicUrl)
      }

      const { error: dbError } = await supabase.from('material').insert({
        teacher_id: user.id,
        name: groupName.trim(),
        type: uploadType,
        unit_id: selectedUnitId ? Number(selectedUnitId) : null,
        files: uploadedUrls,
      })

      if (dbError) throw dbError

      setShowUploadModal(false)
      setGroupName('')
      setSelectedFiles([])
      setUploadType(null)
      setSelectedUnitId('')
      fetchMaterials()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '上传失败'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该资料分组？')) return
    const { error } = await supabase.from('material').delete().eq('material_id', id)
    if (!error) fetchMaterials()
  }

  const handleAssignUnit = async (id: number, unitId: number | null) => {
    await supabase
      .from('material')
      .update({ unit_id: unitId })
      .eq('material_id', id)
    fetchMaterials()
  }

  const openUpload = (type: 'pdf' | 'image_group') => {
    setUploadType(type)
    setShowUploadModal(true)
    setError('')
    setSelectedFiles([])
    setGroupName('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/teach')}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ChevronLeft size={14} /> 返回授课中心
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen size={24} className="text-wall-gold" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">资料管理</h1>
          </div>
          <p className="text-wall-text-muted text-sm">上传和管理授课资料，分配到对应单元</p>
        </div>
        <div className="flex gap-2">
          <SealButton variant="outline" size="sm" onClick={() => openUpload('pdf')}>
            <FileText size={14} className="mr-1" /> 上传 PDF
          </SealButton>
          <SealButton variant="gold" size="sm" onClick={() => openUpload('image_group')}>
            <Image size={14} className="mr-1" /> 上传图片组
          </SealButton>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-wall-paper border-2 border-wall-brick rounded-lg max-w-lg w-full p-6 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif text-wall-text">
                {uploadType === 'pdf' ? '上传 PDF 资料' : '上传图片组'}
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-wall-text-muted hover:text-wall-text"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2 text-sm text-red-700">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-serif text-wall-text mb-1">分组名称</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="如：第三课时-三位数乘法"
                  className="w-full px-3 py-2 bg-wall-paper border-2 border-wall-border rounded text-wall-text font-serif focus:outline-none focus:border-wall-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-serif text-wall-text mb-1">归属单元（可选）</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-wall-paper border-2 border-wall-border rounded text-wall-text font-serif focus:outline-none focus:border-wall-gold"
                >
                  <option value="">暂不分配</option>
                  {units.map((u) => (
                    <option key={u.unit_id} value={u.unit_id}>
                      第 {u.unit_id} 单元 - {u.unit_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-serif text-wall-text mb-1">
                  {uploadType === 'pdf' ? '选择 PDF 文件' : '选择图片（可多选）'}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-wall-border rounded-lg p-8 text-center cursor-pointer hover:border-wall-gold transition-colors"
                >
                  <Upload size={32} className="mx-auto mb-2 text-wall-text-muted" />
                  <p className="text-wall-text-muted text-sm">
                    {selectedFiles.length > 0
                      ? `已选择 ${selectedFiles.length} 个文件`
                      : uploadType === 'pdf'
                        ? '点击选择 PDF 文件'
                        : '点击选择多张图片'}
                  </p>
                  <p className="text-wall-text-muted text-xs mt-1">
                    {uploadType === 'pdf'
                      ? '不支持 Word，请先转为 PDF'
                      : '支持 JPG、PNG 等常见图片格式'}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={uploadType === 'pdf' ? '.pdf' : 'image/*'}
                  multiple={uploadType === 'image_group'}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-wall-text-muted bg-wall-bg-deep px-2 py-1 rounded">
                        <FileText size={12} />
                        <span className="truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SealButton
                variant="gold"
                size="md"
                className="w-full"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-1" />
                    上传中...
                  </>
                ) : (
                  '确认上传'
                )}
              </SealButton>
            </div>
          </div>
        </div>
      )}

      {/* Material List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-wall-text-muted">
          <Loader2 size={24} className="animate-spin mr-2" />
          加载中...
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen size={48} className="mx-auto mb-3 text-wall-text-muted opacity-30" />
          <p className="text-wall-text-muted font-serif">暂无资料</p>
          <p className="text-wall-text-muted text-sm mt-1">点击上方按钮上传 PDF 或图片组</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => {
            const unitName = units.find((u) => u.unit_id === m.unit_id)?.unit_name
            return (
              <ScrollPanel key={m.material_id} title={m.name}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {m.type === 'pdf' ? (
                      <FileText size={16} className="text-wall-brick" />
                    ) : (
                      <Image size={16} className="text-wall-gold" />
                    )}
                    <SealBadge>
                      {m.type === 'pdf' ? 'PDF' : `图片组 · ${m.files.length} 张`}
                    </SealBadge>
                    {unitName && (
                      <span className="text-xs text-wall-text-muted">{unitName}</span>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="bg-wall-bg-deep rounded p-2">
                    {m.type === 'pdf' ? (
                      <div className="flex items-center gap-2 text-sm text-wall-text-muted">
                        <FileText size={14} />
                        <span className="truncate">PDF 文件</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1">
                        {m.files.slice(0, 3).map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt=""
                            className="w-full aspect-square object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <select
                      value={m.unit_id ?? ''}
                      onChange={(e) =>
                        handleAssignUnit(
                          m.material_id,
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="flex-1 px-2 py-1.5 bg-wall-paper border border-wall-border rounded text-sm text-wall-text font-serif focus:outline-none focus:border-wall-gold"
                    >
                      <option value="">分配单元</option>
                      {units.map((u) => (
                        <option key={u.unit_id} value={u.unit_id}>
                          第 {u.unit_id} 单元
                        </option>
                      ))}
                    </select>
                    <a
                      href={m.type === 'pdf' ? m.files[0] : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (m.type === 'image_group') {
                          e.preventDefault()
                          // 打开图片组查看（简单新窗口打开所有图片）
                          m.files.forEach((url) => window.open(url, '_blank'))
                        }
                      }}
                      className="p-1.5 border border-wall-border rounded text-wall-text-muted hover:text-wall-brick hover:border-wall-brick transition-colors"
                      title="查看"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => handleDelete(m.material_id)}
                      className="p-1.5 border border-wall-border rounded text-wall-text-muted hover:text-red-600 hover:border-red-400 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </ScrollPanel>
            )
          })}
        </div>
      )}
    </div>
  )
}
