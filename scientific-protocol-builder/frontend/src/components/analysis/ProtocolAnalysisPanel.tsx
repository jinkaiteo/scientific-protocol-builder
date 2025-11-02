import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Compare as CompareIcon,
  PlayArrow as PlayIcon,
  BugReport as BugReportIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import {
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { protocolAnalysisService, ProtocolAnalysis } from '../../services/protocolAnalysisService';
import { formatDistanceToNow } from 'date-fns';

interface ProtocolAnalysisPanelProps {
  protocolId: string;
  protocolName?: string;
  onAnalysisComplete?: (analysis: ProtocolAnalysis) => void;
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
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export const ProtocolAnalysisPanel: React.FC<ProtocolAnalysisPanelProps> = ({
  protocolId,
  protocolName,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<ProtocolAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [analysisOptions, setAnalysisOptions] = useState({
    includeOptimizations: true,
    includeRiskAssessment: true,
    includeResourceAnalysis: true,
    includePerformanceAnalysis: true
  });

  useEffect(() => {
    if (protocolId) {
      performAnalysis();
    }
  }, [protocolId]);

  const performAnalysis = async () => {
    if (!protocolId) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await protocolAnalysisService.analyzeProtocol(protocolId, analysisOptions);
      setAnalysis(result);
      onAnalysisComplete?.(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze protocol');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'pdf' | 'csv' = 'json') => {
    try {
      const blob = await protocolAnalysisService.exportAnalysis(protocolId, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protocol-${protocolId}-analysis.${format}`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export analysis:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: '#d32f2f',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50'
    };
    return colors[severity as keyof typeof colors] || '#9e9e9e';
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
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Overall Score
                </Typography>
                <Typography variant="h4" color={analysis!.reliability > 80 ? 'success.main' : analysis!.reliability > 60 ? 'warning.main' : 'error.main'}>
                  {Math.round(analysis!.reliability)}%
                </Typography>
              </Box>
              <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Complexity
                </Typography>
                <Typography variant="h4">
                  {analysis!.complexity.toUpperCase()}
                </Typography>
              </Box>
              <TimelineIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Efficiency
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {Math.round(analysis!.efficiency)}%
                </Typography>
              </Box>
              <SpeedIcon sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Critical Issues
                </Typography>
                <Typography variant="h4" color={analysis!.criticalIssues.length > 0 ? 'error.main' : 'success.main'}>
                  {analysis!.criticalIssues.length}
                </Typography>
              </Box>
              <BugReportIcon sx={{ fontSize: 40, color: analysis!.criticalIssues.length > 0 ? 'error.main' : 'success.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Analysis Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Validation Scores" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={[
                { name: 'Safety', score: analysis!.validation.rules.safety ? (analysis!.validation.rules.safety.filter(r => r.passed).length / analysis!.validation.rules.safety.length) * 100 : 100, fill: '#f44336' },
                { name: 'Structural', score: analysis!.validation.rules.structural ? (analysis!.validation.rules.structural.filter(r => r.passed).length / analysis!.validation.rules.structural.length) * 100 : 100, fill: '#2196f3' },
                { name: 'Efficiency', score: analysis!.validation.rules.efficiency ? (analysis!.validation.rules.efficiency.filter(r => r.passed).length / analysis!.validation.rules.efficiency.length) * 100 : 100, fill: '#4caf50' },
                { name: 'Compliance', score: analysis!.validation.rules.compliance ? (analysis!.validation.rules.compliance.filter(r => r.passed).length / analysis!.validation.rules.compliance.length) * 100 : 100, fill: '#ff9800' }
              ]}>
                <RadialBar dataKey="score" cornerRadius={10} fill="#8884d8" />
                <Legend />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Risk Distribution" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analysis!.risks.risk_categories).map(([category, risks]) => ({
                    name: category.replace('_', ' ').toUpperCase(),
                    value: Array.isArray(risks) ? risks.length : 0,
                    fill: getSeverityColor(category)
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {Object.entries(analysis!.risks.risk_categories).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSeverityColor(entry[0])} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Protocol Metadata */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Protocol Metadata" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Steps
                </Typography>
                <Typography variant="h6">
                  {analysis!.protocolMetadata.stepCount}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Instruments Required
                </Typography>
                <Typography variant="h6">
                  {analysis!.protocolMetadata.instrumentCount}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estimated Duration
                </Typography>
                <Typography variant="h6">
                  {Math.round(analysis!.protocolMetadata.estimatedDuration / 60)} min
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant="subtitle2" color="text.secondary">
                  Estimated Cost
                </Typography>
                <Typography variant="h6">
                  ${analysis!.protocolMetadata.resourceCost}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderValidationTab = () => (
    <Box>
      {/* Validation Summary */}
      <Alert 
        severity={analysis!.validation.isValid ? 'success' : analysis!.validation.errors.length > 0 ? 'error' : 'warning'}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1">
          {analysis!.validation.isValid 
            ? 'Protocol validation passed successfully'
            : `Protocol validation failed with ${analysis!.validation.errors.length} error(s) and ${analysis!.validation.warnings.length} warning(s)`
          }
        </Typography>
        <Typography variant="body2">
          Overall validation score: {analysis!.validation.score}%
        </Typography>
      </Alert>

      {/* Validation Categories */}
      <Grid container spacing={3}>
        {Object.entries(analysis!.validation.rules).map(([category, rules]) => (
          <Grid item xs={12} md={6} key={category}>
            <Card>
              <CardHeader 
                title={category.charAt(0).toUpperCase() + category.slice(1)}
                action={
                  <Chip 
                    label={`${rules.filter(r => r.passed).length}/${rules.length}`}
                    color={rules.every(r => r.passed) ? 'success' : rules.some(r => !r.passed && r.severity === 'error') ? 'error' : 'warning'}
                  />
                }
              />
              <CardContent>
                <List dense>
                  {rules.map((rule, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getSeverityIcon(rule.passed ? 'success' : rule.severity)}
                      </ListItemIcon>
                      <ListItemText
                        primary={rule.rule.replace(/_/g, ' ').toUpperCase()}
                        secondary={rule.message}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: rule.passed ? 'success.main' : getSeverityColor(rule.severity)
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Errors and Warnings */}
      {(analysis!.validation.errors.length > 0 || analysis!.validation.warnings.length > 0) && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Issues Found
          </Typography>
          
          {analysis!.validation.errors.map((error, index) => (
            <Alert severity="error" sx={{ mb: 1 }} key={`error-${index}`}>
              <Typography variant="subtitle2">{error.rule}</Typography>
              <Typography variant="body2">{error.message}</Typography>
              {error.suggestions.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption">Suggestions:</Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {error.suggestions.map((suggestion, i) => (
                      <li key={i}>
                        <Typography variant="caption">{suggestion}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Alert>
          ))}

          {analysis!.validation.warnings.map((warning, index) => (
            <Alert severity="warning" sx={{ mb: 1 }} key={`warning-${index}`}>
              <Typography variant="subtitle2">{warning.rule}</Typography>
              <Typography variant="body2">{warning.message}</Typography>
              {warning.suggestions.length > 0 && (
                <Box mt={1}>
                  <Typography variant="caption">Suggestions:</Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {warning.suggestions.map((suggestion, i) => (
                      <li key={i}>
                        <Typography variant="caption">{suggestion}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Alert>
          ))}
        </Box>
      )}
    </Box>
  );

  const renderDependenciesTab = () => (
    <Grid container spacing={3}>
      {/* Critical Path */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Critical Path Analysis" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Longest execution path: {Math.round(analysis!.dependencies.criticalPath?.[0]?.totalDuration / 60) || 0} minutes
            </Typography>
            <Box mt={2}>
              {analysis!.dependencies.criticalPath.length > 0 ? (
                <List dense>
                  {analysis!.dependencies.criticalPath[0]?.path?.map((stepId: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <PlayIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={`Step ${index + 1}`}
                        secondary={stepId}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No critical path identified</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Parallelizable Steps */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Parallelization Opportunities" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Potential time savings: {analysis!.dependencies.parallelizable.reduce((sum, group) => sum + (group.potential_time_saving || 0), 0)} seconds
            </Typography>
            <Box mt={2}>
              {analysis!.dependencies.parallelizable.length > 0 ? (
                analysis!.dependencies.parallelizable.map((group, index) => (
                  <Accordion key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Level {group.level} - {group.nodes.length} parallel steps
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        {group.nodes.map((node: any, nodeIndex: number) => (
                          <ListItem key={nodeIndex}>
                            <ListItemText
                              primary={node.type}
                              secondary={`Duration: ${node.duration}s, Parallelizable: ${node.parallelizable ? 'Yes' : 'No'}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography color="text.secondary">No parallelization opportunities found</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Dependencies Overview */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Dependencies Overview" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Instruments
                </Typography>
                <Typography variant="h6">
                  {analysis!.dependencies.instruments.length}
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reagents
                </Typography>
                <Typography variant="h6">
                  {analysis!.dependencies.reagents.length}
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Protocols
                </Typography>
                <Typography variant="h6">
                  {analysis!.dependencies.protocols.length}
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Data Dependencies
                </Typography>
                <Typography variant="h6">
                  {analysis!.dependencies.data.length}
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Personnel
                </Typography>
                <Typography variant="h6">
                  {analysis!.dependencies.personnel.length}
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bottlenecks
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {analysis!.dependencies.bottlenecks.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderOptimizationsTab = () => (
    <Grid container spacing={3}>
      {Object.entries(analysis!.optimizations.categories).map(([category, suggestions]) => (
        Array.isArray(suggestions) && suggestions.length > 0 && (
          <Grid item xs={12} md={6} key={category}>
            <Card>
              <CardHeader 
                title={category.charAt(0).toUpperCase() + category.slice(1)}
                action={
                  <Badge badgeContent={suggestions.length} color="primary">
                    <LightbulbIcon />
                  </Badge>
                }
              />
              <CardContent>
                <List dense>
                  {suggestions.map((suggestion: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <LightbulbIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion.description || suggestion.strategy}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Impact: {suggestion.impact || suggestion.expected_impact}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Effort: {suggestion.implementation_difficulty || suggestion.implementation_effort}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )
      ))}

      {/* Recommendations */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Top Recommendations" />
          <CardContent>
            {analysis!.recommendations.length > 0 ? (
              <List>
                {analysis!.recommendations.slice(0, 5).map((recommendation, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUpIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={recommendation.description}
                        secondary={
                          <Box>
                            <Chip label={recommendation.priority} size="small" color="primary" sx={{ mr: 1 }} />
                            <Chip label={recommendation.type} size="small" variant="outlined" />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < analysis!.recommendations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No specific recommendations available</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" p={4}>
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Analyzing Protocol...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a few moments
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" onClick={performAnalysis}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="text.secondary">
          No analysis available
        </Typography>
        <Button 
          variant="contained" 
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
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Protocol Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {protocolName || `Protocol ${protocolId}`} • 
            Analyzed {formatDistanceToNow(new Date(analysis.analyzedAt), { addSuffix: true })} • 
            Analysis time: {analysis.analysisTime}ms
          </Typography>
        </Box>
        
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={performAnalysis}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('json')}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<CompareIcon />}
            onClick={() => {/* Implement comparison */}}
          >
            Compare
          </Button>
        </Box>
      </Box>

      {/* Critical Issues Alert */}
      {analysis.criticalIssues.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {analysis.criticalIssues.length} Critical Issue(s) Found
          </Typography>
          {analysis.criticalIssues.slice(0, 3).map((issue, index) => (
            <Typography variant="body2" key={index}>
              • {issue.message}
            </Typography>
          ))}
          {analysis.criticalIssues.length > 3 && (
            <Typography variant="body2">
              ... and {analysis.criticalIssues.length - 3} more
            </Typography>
          )}
        </Alert>
      )}

      {/* Analysis Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" />
          <Tab label="Validation" />
          <Tab label="Dependencies" />
          <Tab label="Optimizations" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderValidationTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {renderDependenciesTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {renderOptimizationsTab()}
      </TabPanel>
    </Box>
  );
};