import React from 'react';
import { useParty, useStreamQueries } from '@c7/react';
import { Credit } from '@canton-carbon-credits/daml.js/daml/CarbonCredit';
import { Retirement } from '@canton-carbon-credits/daml.js/daml/Retirement';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box, Chip } from '@mui/material';

const cardStyle: React.CSSProperties = {
  padding: '24px',
  marginBottom: '24px',
  borderRadius: '8px',
};

const tableHeaderStyle: React.CSSProperties = {
  fontWeight: 'bold',
  backgroundColor: '#f5f5f5',
};

const CreditPortfolio: React.FC = () => {
  const party = useParty();
  const queries = useStreamQueries({
    activeCredits: () => ({
      template: Credit,
      query: { owner: party },
    }),
    retiredCredits: () => ({
      template: Retirement,
      query: { retirer: party },
    }),
  });

  if (queries.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const activeCredits = queries.contracts.activeCredits;
  const retiredCredits = queries.contracts.retiredCredits;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Carbon Credit Portfolio
      </Typography>

      <Paper elevation={2} sx={cardStyle}>
        <Typography variant="h5" gutterBottom>
          Active Credits
        </Typography>
        {activeCredits.length === 0 ? (
          <Typography>You do not currently own any active carbon credits.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderStyle}>Issuer</TableCell>
                  <TableCell sx={tableHeaderStyle}>Project Type</TableCell>
                  <TableCell sx={tableHeaderStyle}>Vintage</TableCell>
                  <TableCell sx={tableHeaderStyle} align="right">Quantity (Tonnes)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeCredits.map(credit => (
                  <TableRow key={credit.contractId}>
                    <TableCell>
                      <Chip label={credit.payload.issuer.slice(0, 8)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{credit.payload.projectType}</TableCell>
                    <TableCell>{credit.payload.vintage}</TableCell>
                    <TableCell align="right">{parseFloat(credit.payload.quantity).toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Paper elevation={2} sx={cardStyle}>
        <Typography variant="h5" gutterBottom>
          Retirement History
        </Typography>
        {retiredCredits.length === 0 ? (
          <Typography>You have not retired any carbon credits yet.</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderStyle}>Retirement Date</TableCell>
                  <TableCell sx={tableHeaderStyle}>Issuer</TableCell>
                  <TableCell sx={tableHeaderStyle}>Project Type</TableCell>
                  <TableCell sx={tableHeaderStyle}>Vintage</TableCell>
                  <TableCell sx={tableHeaderStyle} align="right">Quantity (Tonnes)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {retiredCredits.map(retirement => (
                  <TableRow key={retirement.contractId}>
                    <TableCell>{new Date(retirement.payload.retirementDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                       <Chip label={retirement.payload.issuer.slice(0, 8)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{retirement.payload.projectType}</TableCell>
                    <TableCell>{retirement.payload.vintage}</TableCell>
                    <TableCell align="right">{parseFloat(retirement.payload.quantity).toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default CreditPortfolio;