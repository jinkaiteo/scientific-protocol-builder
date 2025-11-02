import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { protocolAnalysisService, ProtocolAnalysis } from '../../services/protocolAnalysisService';

interface MobileAnalysisPanelProps {
  protocolId: string;
  protocolName?: string;
  isMobile?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mobile-analysis-tabpanel-${index}`}
      aria-labelledby={`mobile-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export const MobileAnalysisPanel: React.FC<MobileAnalysisPanelProps> = ({
  protocolId,
  protocolName,
  isMobile = true
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [analysis, setAnalysis] = useState<ProtocolAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (protocolId) {
      performAnalysis();
    }
  }, [protocolId]);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await protocolAnalysisService.analyzeProtocol(protocolId, {
        includeOptimizations: true,
        includeRiskAssessment: true,
        includeResourceAnalysis: true,
        includePerformanceAnalysis: true
      });
      
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze protocol');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'error',
      error: 'error',
      warning: 'warning',
      info: 'info',
      success: 'success'
    };
    return colors[severity as keyof typeof colors] || 'default';
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      critical: <ErrorIcon />,
      error: <ErrorIcon />,
      warning: <WarningIcon />,
      info: <CheckCircleIcon />,
      success: <CheckCircleIcon />
    };
    return icons[severity as keyof typeof icons] || <CheckCircleIcon />;
  };

  const renderOverviewTab = () => (
    <Box>
      {/* Quick Stats Cards */}
      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <Card variant="outlined">
          <CardContent sx={{ py: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Overall Score
                </Typography>
                <Typography variant="h5" color={analysis!.reliability > 80 ? 'success.main' : analysis!.reliability > 60 ? 'warning.main' : 'error.main'}>
                  {Math.round(analysis!.reliability)}%
                </Typography>
              </Box>
              <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
            </Box>
          </CardContent>
        </Card>

        <Box display="flex" gap={1}>
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Complexity
              </Typography>
              <Typography variant="h6">
                {analysis!.complexity.toUpperCase()}
              </Typography>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ flex: 1 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Efficiency
              </Typography>
              <Typography variant="h6" color="primary.main">
                {Math.round(analysis!.efficiency)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Critical Issues Alert */}
      {analysis!.criticalIssues.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {analysis!.criticalIssues.length} Critical Issue(s)
          </Typography>
          {analysis!.criticalIssues.slice(0, 2).map((issue, index) => (
            <Typography variant="body2" key={index} sx={{ fontSize: '0.875rem' }}>
              • {issue.message}
            </Typography>
          ))}
          {analysis!.criticalIssues.length > 2 && (
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              ... and {analysis!.criticalIssues.length - 2} more
            </Typography>
          )}
        </Alert>
      )}

      {/* Protocol Metadata */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Protocol Information
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip 
              label={`${analysis!.protocolMetadata.stepCount} steps`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${analysis!.protocolMetadata.instrumentCount} instruments`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${Math.round(analysis!.protocolMetadata.estimatedDuration / 60)} min`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`$${analysis!.protocolMetadata.resourceCost}`} 
              size="small" 
              variant="outlined" 
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderValidationTab = () => (
    <Box>
      {/* Validation Summary */}
      <Alert 
        severity={analysis!.validation.isValid ? 'success' : analysis!.validation.errors.length > 0 ? 'error' : 'warning'}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          Validation Score: {analysis!.validation.score}%
        </Typography>
        <Typography variant="caption">
          {analysis!.validation.errors.length} errors, {analysis!.validation.warnings.length} warnings
        </Typography>
      </Alert>

      {/* Validation Categories */}
      {Object.entries(analysis!.validation.rules).map(([category, rules]) => (
        <Accordion key={category} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ py: 1 }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {category.replace('_', ' ')}
              </Typography>
              <Chip 
                label={`${rules.filter(r => r.passed).length}/${rules.length}`}
                size="small"
                color={rules.every(r => r.passed) ? 'success' : rules.some(r => !r.passed && r.severity === 'error') ? 'error' : 'warning'}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ py: 1 }}>
            <List dense>
              {rules.slice(0, 3).map((rule, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {getSeverityIcon(rule.passed ? 'success' : rule.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {rule.rule.replace(/_/g, ' ').toUpperCase()}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {rule.message}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {rules.length > 3 && (
                <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                  ... and {rules.length - 3} more rules
                </Typography>
              )}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  const renderOptimizationsTab = () => (
    <Box>
      {Object.entries(analysis!.optimizations.categories).map(([category, suggestions]) => (
        Array.isArray(suggestions) && suggestions.length > 0 && (
          <Accordion key={category} variant="outlined" sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 1 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                  {category} Optimization
                </Typography>
                <Chip label={suggestions.length} size="small" color="primary" />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ py: 1 }}>
              <List dense>
                {suggestions.slice(0, 2).map((suggestion: any, index: number) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <TrendingUpIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                          {suggestion.description || suggestion.strategy}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            Impact: {suggestion.impact || suggestion.expected_impact}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {suggestions.length > 2 && (
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                    ... and {suggestions.length - 2} more suggestions
                  </Typography>
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        )
      ))}

      {/* Top Recommendations */}
      <Card variant="outlined" sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Top Recommendations
          </Typography>
          {analysis!.recommendations.slice(0, 3).map((recommendation, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {recommendation.description}
              </Typography>
              <Box display="flex" gap={0.5} mt={0.5}>
                <Chip label={recommendation.priority} size="small" color="primary" />
                <Chip label={recommendation.type} size="small" variant="outlined" />
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );

  const renderDependenciesTab = () => (
    <Box>
      {/* Dependencies Summary */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Dependencies Overview
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip 
              label={`${analysis!.dependencies.instruments.length} instruments`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${analysis!.dependencies.reagents.length} reagents`} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={`${analysis!.dependencies.bottlenecks.length} bottlenecks`} 
              size="small" 
              color="warning"
              variant="outlined" 
            />
          </Box>
        </CardContent>
      </Card>

      {/* Critical Path */}
      <Accordion variant="outlined" sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <TimelineIcon fontSize="small" />
            <Typography variant="body2">Critical Path</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" color="text.secondary">
            Longest execution path: {Math.round((analysis!.dependencies.criticalPath?.[0]?.totalDuration || 0) / 60)} minutes
          </Typography>
          {analysis!.dependencies.criticalPath.length > 0 && (
            <List dense>
              {analysis!.dependencies.criticalPath[0]?.path?.slice(0, 3).map((stepId: string, index: number) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="caption">
                        Step {index + 1}: {stepId}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Parallelization */}
      <Accordion variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={1}>
            <SpeedIcon fontSize="small" />
            <Typography variant="body2">Parallelization</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {analysis!.dependencies.parallelizable.length} parallel opportunities found
          </Typography>
          {analysis!.dependencies.parallelizable.slice(0, 2).map((group, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption">
                Level {group.level}: {group.nodes.length} steps can run in parallel
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(group.potential_time_saving || 0) / 100} 
                sx={{ mt: 0.5, height: 4 }}
              />
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={3}>
        <CircularProgress size={40} />
        <Typography variant="body2" mt={2} color="text.secondary">
          Analyzing Protocol...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={performAnalysis}>
            Retry
          </Button>
        }
        sx={{ m: 2 }}
      >
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="body2" color="text.secondary">
          No analysis available
        </Typography>
        <Button 
          variant="contained" 
          size="small"
          startIcon={<AssessmentIcon />}
          onClick={performAnalysis}
          sx={{ mt: 2 }}
        >
          Start Analysis
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Mobile-optimized tabs */}
      <Tabs 
        value={currentTab} 
        onChange={(e, newValue) => setCurrentTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': {
            minWidth: 80,
            fontSize: '0.75rem',
            py: 1
          }
        }}
      >
        <Tab label="Overview" />
        <Tab label="Validation" />
        <Tab label="Optimize" />
        <Tab label="Dependencies" />
      </Tabs>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
        <TabPanel value={currentTab} index={0}>
          {renderOverviewTab()}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {renderValidationTab()}
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          {renderOptimizationsTab()}
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          {renderDependenciesTab()}
        </TabPanel>
      </Box>
    </Box>
  );
};