import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box
} from '@mui/material';

export default function Matrix({ rows, matrixData, setMatrixData }) {
  const [targets, setTargets] = useState([]);

  useEffect(() => {
    const sdgTargets = rows
      .map(row => row.sdgTarget)
      .filter(Boolean)
      .flatMap(str => str.split(';').map(t => t.trim()))
      .filter((v, i, a) => a.indexOf(v) === i);
    setTargets(sdgTargets);

    if (Object.keys(matrixData).length === 0 && sdgTargets.length > 0) {
      const initial = {};
      sdgTargets.forEach(influencing => {
        initial[influencing] = {};
        sdgTargets.forEach(influenced => {
          initial[influencing][influenced] = 0;
        });
      });
      setMatrixData(initial);
    }
  }, [rows]);

  const handleCellClick = (from, to) => {
    const current = matrixData?.[from]?.[to] ?? 0;
    const newValue = current === 3 ? -3 : current + 1;
    setMatrixData(prev => {
      const updated = {
        ...prev,
        [from]: {
          ...prev[from],
          [to]: newValue,
        },
      };
      localStorage.setItem('matrixData', JSON.stringify(updated));
      return updated;
    });
  };

  const getCellColor = value => {
    const colors = {
      '-3': '#800000',
      '-2': '#B22222',
      '-1': '#DC143C',
      '0': '#FFFFFF',
      '1': '#FFD700',
      '2': '#90EE90',
      '3': '#008000',
    };
    return colors[value.toString()] || '#FFFFFF';
  };

  const calculateRowSum = from => {
    return targets.reduce((sum, to) => sum + (matrixData?.[from]?.[to] ?? 0), 0);
  };

  const calculateColSum = to => {
    return targets.reduce((sum, from) => sum + (matrixData?.[from]?.[to] ?? 0), 0);
  };

  useEffect(() => {
    const stored = localStorage.getItem('matrixData');
    if (stored) {
      setMatrixData(JSON.parse(stored));
    }
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
        Quantitative SDG Interlinkage Matrix
      </Typography>

      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#002D62', color: 'white' }}>
                Influencing ↓ / Influenced →
              </TableCell>
              {targets.map(to => (
                <TableCell key={to} align="center" sx={{ backgroundColor: '#002D62', color: 'white' }}>{to}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#002D62', color: 'white' }}>Out sum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {targets.map(from => (
              <TableRow key={from} hover>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#F0F0F0' }}>{from}</TableCell>
                {targets.map(to => (
                  <TableCell
                    key={to}
                    align="center"
                    onClick={() => handleCellClick(from, to)}
                    sx={{
                      backgroundColor: getCellColor(matrixData?.[from]?.[to] ?? 0),
                      cursor: 'pointer',
                      border: '1px solid #ccc',
                      minWidth: 40,
                      height: 40
                    }}
                  />
                ))}
                <TableCell sx={{ backgroundColor: '#E3F2FD' }}>{calculateRowSum(from)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#E3F2FD' }}>In sum</TableCell>
              {targets.map(to => (
                <TableCell key={to} align="center" sx={{ backgroundColor: '#E3F2FD' }}>
                  {calculateColSum(to)}
                </TableCell>
              ))}
              <TableCell sx={{ backgroundColor: '#E3F2FD' }} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Interaction Scale</Typography>
        <Box display="flex" flexDirection="column" gap={1} mt={1}>
          <LegendItem color="#800000" label="-3 Cancelling" />
          <LegendItem color="#B22222" label="-2 Counteracting" />
          <LegendItem color="#DC143C" label="-1 Constraining" />
          <LegendItem color="#FFFFFF" label="0 Consistent" border />
          <LegendItem color="#FFD700" label="+1 Enabling" />
          <LegendItem color="#90EE90" label="+2 Reinforcing" />
          <LegendItem color="#008000" label="+3 Indivisible" />
        </Box>
      </Box>
    </Box>
  );
}

const LegendItem = ({ color, label, border }) => (
  <Box display="flex" alignItems="center">
    <Box
      sx={{
        width: 20,
        height: 20,
        backgroundColor: color,
        border: border ? '1px solid black' : 'none',
        marginRight: 1
      }}
    />
    <Typography variant="body2">{label}</Typography>
  </Box>
);