import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Unit, Material } from '../types'
import { GreatWallDivider, ScrollPanel } from '../components/ui/BrickCard'
import { SealButton, SealBadge } from '../components/ui/SealButton'
import { BookOpen, FileText, Download, ArrowLeft, Loader2, FolderOpen, Image, ChevronLeft, ChevronRight, X } from 'lucide-react'

const TEXTBOOK_MAP: Record<number, string> = {
  2: '/textbook/一_万以上数的认识.pdf',
  3: '/textbook/二_角的度量.pdf',
  4: '/textbook/三_多位数乘两位数.pdf',
  5: '/textbook/四_加法模型和乘法模型.pdf',
  6: '/textbook/五_平行四边形和梯形.pdf',
  7: '/textbook/六_条形统计图.pdf',
  8: '/textbook/七_复习与关联.pdf',
}

export default function ContentTeachPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<Material | 'textbook' | null>(null)
  const [imageIdx, setImageIdx] = useState(0)

  useEffect(() => {
    if (unitId) {
      fetchUnit()
      fetchMaterials()
    }
  }, [unitId])

  const fetchUnit = async () => {
    setLoading(true)
    const id = Number(unitId)
    const { data } = await supabase.from('unit').select('*').eq('unit_id', id).single()
    if (data) setUnit(data as Unit)
    setLoading(false)
  }

  const fetchMaterials = async () => {
    const id = Number(unitId)
    const { data } = await supabase
      .from('material')
      .select('*')
      .eq('unit_id', id)
      .order('created_at', { ascending: false })
    if (data) setMaterials(data as Material[])
  }

  const textbookUrl = unit ? TEXTBOOK_MAP[unit.unit_id] : null

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px-88px)] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-wall-text-muted" />
      </div>
    )
  }

  if (!unit) return <div className="p-8 text-center text-wall-text-muted">单元不存在</div>

  // Viewer mode
  if (viewing === 'textbook' && textbookUrl) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setViewing(null)}
            className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm transition-colors"
          >
            <ArrowLeft size={14} /> 返回分组
          </button>
          <div className="flex gap-2">
            <a
              href={textbookUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-wall-brick/10 text-wall-brick-dark font-serif text-sm rounded border border-wall-brick/30 hover:bg-wall-brick/20 transition-colors"
            >
              <Download size={14} /> 下载
            </a>
          </div>
        </div>
        <div className="bg-wall-paper border-2 border-wall-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          <iframe src={textbookUrl} className="w-full h-full border-0" title={`${unit.unit_name} 教材`} />
        </div>
      </div>
    )
  }

  if (viewing && typeof viewing === 'object') {
    if (viewing.type === 'pdf') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setViewing(null)}
              className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm transition-colors"
            >
              <ArrowLeft size={14} /> 返回分组
            </button>
            <span className="font-serif text-wall-text">{viewing.name}</span>
          </div>
          <div className="bg-wall-paper border-2 border-wall-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            <iframe src={viewing.files[0]} className="w-full h-full border-0" title={viewing.name} />
          </div>
        </div>
      )
    }

    // Image group viewer
    const currentImage = viewing.files[imageIdx]
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setViewing(null)}
            className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm transition-colors"
          >
            <ArrowLeft size={14} /> 返回分组
          </button>
          <span className="font-serif text-wall-text">{viewing.name} · {imageIdx + 1}/{viewing.files.length}</span>
        </div>
        <div className="bg-wall-paper border-2 border-wall-border rounded-lg overflow-hidden relative" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
          <img src={currentImage} alt="" className="w-full h-full object-contain" />
          {viewing.files.length > 1 && (
            <>
              <button
                onClick={() => setImageIdx((i) => (i > 0 ? i - 1 : viewing.files.length - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setImageIdx((i) => (i < viewing.files.length - 1 ? i + 1 : 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {viewing.files.map((url, i) => (
            <button
              key={i}
              onClick={() => setImageIdx(i)}
              className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${i === imageIdx ? 'border-wall-gold' : 'border-wall-border'}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Group list mode
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/teach/content')}
        className="flex items-center gap-1 text-wall-text-muted hover:text-wall-brick-dark font-serif text-sm mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> 返回单元选择
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={24} className="text-wall-brick" />
            <h1 className="text-2xl font-serif text-wall-text tracking-wider">{unit.unit_name}</h1>
          </div>
          <SealBadge>第 {unit.unit_id} 单元</SealBadge>
          <p className="text-wall-text-muted mt-2">{unit.unit_desc}</p>
        </div>
        <SealButton variant="outline" size="sm" onClick={() => navigate('/teach/materials')}>
          <FolderOpen size={14} className="mr-1" />
          资料管理
        </SealButton>
      </div>

      <GreatWallDivider />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Textbook group */}
        {textbookUrl && (
          <div
            onClick={() => window.open(textbookUrl, '_blank')}
            className="group cursor-pointer bg-wall-paper border-2 border-wall-brick rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-wall-brick/10 border border-wall-brick rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-wall-brick" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-wall-text">教材</h3>
                <p className="text-wall-text-muted text-xs">默认教材 PDF</p>
              </div>
            </div>
            <p className="text-wall-text-muted text-sm line-clamp-2">点击在新窗口查看教材内容</p>
          </div>
        )}

        {/* Material groups */}
        {materials.map((m) => (
          <div
            key={m.material_id}
            onClick={() => { setViewing(m); setImageIdx(0) }}
            className="group cursor-pointer bg-wall-paper border-2 border-wall-border rounded-lg p-6 hover:border-wall-gold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-wall-gold/10 border border-wall-gold rounded-lg flex items-center justify-center">
                {m.type === 'pdf' ? (
                  <FileText size={24} className="text-wall-gold" />
                ) : (
                  <Image size={24} className="text-wall-gold" />
                )}
              </div>
              <div>
                <h3 className="font-serif text-lg text-wall-text line-clamp-1">{m.name}</h3>
                <p className="text-wall-text-muted text-xs">
                  {m.type === 'pdf' ? 'PDF 文件' : `图片组 · ${m.files.length} 张`}
                </p>
              </div>
            </div>
            {m.type === 'image_group' && m.files.length > 0 && (
              <div className="grid grid-cols-3 gap-1 mt-2">
                {m.files.slice(0, 3).map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded" />
                ))}
              </div>
            )}
          </div>
        ))}

        {materials.length === 0 && !textbookUrl && (
          <div className="col-span-full text-center py-12 text-wall-text-muted">
            <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-serif">本单元暂无资料</p>
            <p className="text-sm mt-1">请前往资料管理上传</p>
          </div>
        )}
      </div>
    </div>
  )
}
