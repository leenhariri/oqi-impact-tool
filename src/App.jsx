import React, { useState, useRef } from 'react'
import ReactFlow, {
  addEdge,
  MarkerType,
  Position,
  Handle,
} from 'reactflow'
import 'reactflow/dist/style.css'
import TableInput from './components/TableInput'
import Matrix from './components/Matrix'
import './App.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const hierarchyMap = {
  'Long-term Impact': { y: 0, color: '#B3DFFC' },
  'Mid-term Impact': { y: 150, color: '#CBB3FF' },
  'Short-term Impact': { y: 300, color: '#F5CBA7' },
  'Output': { y: 450, color: '#F9E79F' },
  'Activities': { y: 600, color: '#AED6F1' },
  'Assumptions': { y: 750, color: '#ABEBC6' },
}

function BoxNode({ data, isConnectable }) {
  const handleStyle = (position) => {
    const offset = 8
    switch (position) {
      case Position.Top: return { top: -offset }
      case Position.Bottom: return { bottom: -offset }
      case Position.Left: return { left: -offset }
      case Position.Right: return { right: -offset }
      default: return {}
    }
  }

  return (
    <div className="custom-node">
      {['Top', 'Bottom', 'Left', 'Right'].map(pos => (
        <Handle
          key={`target-${pos}`}
          type="target"
          position={Position[pos]}
          isConnectable={isConnectable}
          style={{ background: '#333', ...handleStyle(Position[pos]) }}
        />
      ))}
      <div className="custom-node-label">
        {data.label}
      </div>
      {['Top', 'Bottom', 'Left', 'Right'].map(pos => (
        <Handle
          key={`source-${pos}`}
          type="source"
          position={Position[pos]}
          isConnectable={isConnectable}
          style={{ background: '#333', ...handleStyle(Position[pos]) }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const [view, setView] = useState('table')
  const [rows, setRows] = useState([
    { hierarchy: 'Long-term Impact', resultStatement: 'Achieve sustainable access', indicator: '', definition: '', measurement: '', baseline: '', risks: '', sdg: '', sdgTarget: '' },
    { hierarchy: 'Mid-term Impact', resultStatement: '1. Improved operational response to leak incidents and maintenance', indicator: '', definition: '', measurement: '', baseline: '', risks: '', sdg: '', sdgTarget: '' },
    { hierarchy: 'Mid-term Impact', resultStatement: '2. Efficient water distribution network and water usage/consumption', indicator: '', definition: '', measurement: '', baseline: '', risks: '', sdg: '', sdgTarget: '' },
    { hierarchy: 'Mid-term Impact', resultStatement: '3. Reduced water loss', indicator: '', definition: '', measurement: '', baseline: '', risks: '', sdg: '', sdgTarget: '' },
    { hierarchy: 'Activities', resultStatement: '', indicator: '', definition: '', measurement: '', baseline: '', risks: '', sdg: '', sdgTarget: '' },
  ])
  const [edges, setEdges] = useState([])
  const [matrixData, setMatrixData] = useState({})
  const diagramRef = useRef(null)

  const addRow = () => {
    setRows(r => [...r, {
      hierarchy: 'Long-term Impact', resultStatement: '', indicator: '', definition: '', measurement: '', baseline: '', risks: '', sdg: '', sdgTarget: ''
    }])
  }

  const removeRow = idx => {
    setRows(r => r.filter((_, i) => i !== idx))
  }

  const handleInput = (rowIdx, field, value) => {
    setRows(r => {
      const copy = [...r]
      copy[rowIdx][field] = value
      return copy
    })
  }

  const generateNodes = rows => {
    const nodes = []

    nodes.push({
      id: 'external',
      type: 'box',
      data: { label: 'External Factors / Risks' },
      position: { x: 0, y: hierarchyMap['Long-term Impact'].y - 80 },
      style: { background: '#E74C3C', color: '#fff', padding: 10, border: '1px solid #333', borderRadius: 4 }
    })

    const grouped = {}
    rows.forEach(r => {
      (grouped[r.hierarchy] ??= []).push(r)
    })

    const maxPer = Math.max(...Object.values(grouped).map(arr => arr.length))
    const maxW = 800
    const gap = 50
    const width = (maxW - gap * (maxPer - 1)) / maxPer

    Object.entries(grouped).forEach(([hier, arr]) => {
      const { y, color } = hierarchyMap[hier] ?? { y: 0, color: '#DDD' }

      nodes.push({
        id: `hierarchy-${hier}`,
        type: 'box',
        data: { label: hier },
        position: { x: 200, y },
        style: { background: '#3498DB', color: '#fff', padding: 5, border: '1px solid #333', borderRadius: 4 }
      })

      const totalW = arr.length * width + (arr.length - 1) * gap
      const offsetX = (maxW - totalW) / 2
      arr.forEach((row, i) => {
        nodes.push({
          id: `${hier}-${i}`,
          type: 'box',
          data: { label: row.resultStatement || '(Empty)' },
          position: { x: 400 + offsetX + i * (width + gap), y },
          style: { background: color, width, padding: 5, border: '1px solid #333', borderRadius: 4 }
        })
      })
    })

    return nodes
  }

  const exportToPDF = async () => {
    if (diagramRef.current) {
      const canvas = await html2canvas(diagramRef.current)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('diagram.pdf')
    }
  }

  const nodes = generateNodes(rows)
  const nodesWithHandles = nodes.map(n => ({
    ...n,
    type: 'box',
    draggable: true
  }))

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
        <button className="primary-button" onClick={() => setView('table')}>Edit Table</button>
        <button className="primary-button" onClick={() => setView('diagram')}>View Diagram</button>
        <button className="primary-button" onClick={() => setView('matrix')}>View SDG Matrix</button>
      </div>

      {view === 'table' ? (
        <TableInput
          rows={rows}
          onChange={handleInput}
          onAddRow={addRow}
          onRemoveRow={removeRow}
        />
      ) : view === 'diagram' ? (
        <div className="diagram-wrapper" ref={diagramRef} style={{ position: 'relative', height: '80vh' }}>
<div style={{
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
  display: 'flex',
  gap: '10px',
  pointerEvents: 'none', // disables blocking below elements
}}>
  <button
    className="primary-button"
    onClick={() => setEdges([])}
    style={{ pointerEvents: 'auto' }} // re-enable clicks on button
  >
    Clear All Arrows
  </button>
  <button
    className="primary-button"
    onClick={exportToPDF}
    style={{ pointerEvents: 'auto' }}
  >
    Export PDF
  </button>
</div>

          <ReactFlow
            nodes={nodesWithHandles}
            edges={edges}
            fitView
            panOnDrag
            zoomOnScroll
            nodeTypes={{ box: BoxNode }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: '#00274C', strokeWidth: 2 },
            }}
            onConnect={connection => setEdges(es => addEdge(connection, es))}
            onEdgesDelete={deleted => setEdges(es => es.filter(e => !deleted.find(d => d.id === e.id)))}
          />
        </div>
      ) : (
        <Matrix
          rows={rows}
          matrixData={matrixData}
          setMatrixData={setMatrixData}
        />
      )}
    </div>
  )
}
