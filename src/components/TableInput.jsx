import React, { useState } from 'react';
import '../App.css';
import { sdgTargets } from '../data/sdgData';

export default function TableInput({ rows, onChange, onAddRow, onRemoveRow }) {
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);

  const toggleTarget = (i, value) => {
    const selected = rows[i].sdgTarget ? rows[i].sdgTarget.split(';') : [];
    const updated = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(i, 'sdgTarget', updated.join(';'));
  };

  const renderSelected = (sdg, sdgTarget) => {
    if (!sdgTarget) return 'Select target';
    const selected = sdgTarget.split(';');
    const labels = (sdgTargets[sdg] || []).filter(t => selected.includes(t.value));
    return labels.map(t => `${t.value} - ${t.label}`).join(', ');
  };

  return (
    <div className="table-card">
      <table className="indicator-table">
        <thead>
          <tr>
            <th>HIERARCHY</th>
            <th>RESULT STATEMENT</th>
            <th>INDICATOR</th>
            <th>INDICATOR DEFINITION</th>
            <th>MEANS OF MEASUREMENT</th>
            <th>BASELINE</th>
            <th>RISKS</th>
            <th>SDG</th>
            <th>SDG TARGET</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <select value={row.hierarchy} onChange={(e) => onChange(i, 'hierarchy', e.target.value)}>
                  <option>Long-term Impact</option>
                  <option>Mid-term Impact</option>
                  <option>Short-term Impact</option>
                  <option>Output</option>
                  <option>Activities</option>
                  <option>Assumptions</option>
                </select>
              </td>

              <td><input value={row.resultStatement} onChange={(e) => onChange(i, 'resultStatement', e.target.value)} /></td>
              <td><input value={row.indicator} onChange={(e) => onChange(i, 'indicator', e.target.value)} /></td>
              <td><input value={row.definition} onChange={(e) => onChange(i, 'definition', e.target.value)} /></td>
              <td><input value={row.measurement} onChange={(e) => onChange(i, 'measurement', e.target.value)} /></td>
              <td><input value={row.baseline} onChange={(e) => onChange(i, 'baseline', e.target.value)} /></td>
              <td><textarea rows="1" value={row.risks} onChange={(e) => onChange(i, 'risks', e.target.value)} /></td>

              <td>
                <select value={row.sdg || ''} onChange={(e) => onChange(i, 'sdg', e.target.value)}>
                  <option value="">Select SDG</option>
                  {Array.from({ length: 17 }, (_, idx) => (
                    <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                  ))}
                </select>
              </td>

              <td>
                <div className="dropdown-wrapper">
                  <div
                    className="dropdown-button"
                    onClick={() => setDropdownOpenIndex(dropdownOpenIndex === i ? null : i)}
                  >
                    {renderSelected(row.sdg, row.sdgTarget)}
                  </div>
                  {dropdownOpenIndex === i && (
                    <div className="dropdown-menu">
                      {(sdgTargets[row.sdg] || []).map(target => (
                        <label key={target.value} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={row.sdgTarget?.split(';').includes(target.value) || false}
                            onChange={() => toggleTarget(i, target.value)}
                          />
                          &nbsp;{target.value} - {target.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </td>

              <td>
                <button className="remove-button" onClick={() => onRemoveRow(i)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-button" onClick={onAddRow}>Add Row</button>

      <style>{`
        .dropdown-wrapper {
          position: relative;
          width: 250px;
        }
        .dropdown-button {
          border: 1px solid #ccc;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          background-color: white;
          font-size: 12px;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid #ccc;
          background-color: white;
          z-index: 10;
          font-size: 12px;
        }
        .dropdown-item {
          display: block;
          padding: 4px 8px;
          white-space: normal;
        }
        .dropdown-item input {
          margin-right: 4px;
        }
      `}</style>
    </div>
  );
}
