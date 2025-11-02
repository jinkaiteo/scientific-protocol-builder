// Protocol Storage System - Save and retrieve protocols with metadata

class ProtocolStorage {
    constructor() {
        this.storageKey = 'scientific_protocols';
        this.metadataKey = 'protocol_metadata';
        this.currentUser = this.getCurrentUser();
        this.initializeStorage();
    }
    
    // Initialize storage structure
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({}));
        }
        if (!localStorage.getItem(this.metadataKey)) {
            localStorage.setItem(this.metadataKey, JSON.stringify({}));
        }
    }
    
    // Get current user (can be extended for authentication)
    getCurrentUser() {
        return localStorage.getItem('current_user') || 'default_user';
    }
    
    // Set current user
    setCurrentUser(username) {
        localStorage.setItem('current_user', username);
        this.currentUser = username;
    }
    
    // Save protocol with metadata
    saveProtocol(protocolData, metadata = {}) {
        try {
            const protocolId = this.generateProtocolId(metadata.name || 'Untitled Protocol');
            const timestamp = new Date().toISOString();
            
            // Prepare protocol data
            const protocolRecord = {
                id: protocolId,
                name: metadata.name || 'Untitled Protocol',
                description: metadata.description || '',
                author: this.currentUser,
                created: timestamp,
                modified: timestamp,
                version: metadata.version || '1.0',
                tags: metadata.tags || [],
                category: metadata.category || 'General',
                workspace_xml: protocolData.xml,
                workspace_json: protocolData.json || null,
                analysis: protocolData.analysis || null,
                readonly: metadata.readonly || false,
                shared: metadata.shared || false
            };
            
            // Save to storage
            const protocols = this.getAllProtocols();
            protocols[protocolId] = protocolRecord;
            localStorage.setItem(this.storageKey, JSON.stringify(protocols));
            
            // Update metadata index
            this.updateMetadataIndex(protocolRecord);
            
            return protocolId;
        } catch (error) {
            console.error('Error saving protocol:', error);
            throw new Error('Failed to save protocol: ' + error.message);
        }
    }
    
    // Load protocol by ID
    loadProtocol(protocolId) {
        try {
            const protocols = this.getAllProtocols();
            const protocol = protocols[protocolId];
            
            if (!protocol) {
                throw new Error('Protocol not found');
            }
            
            // Update last accessed time
            protocol.lastAccessed = new Date().toISOString();
            protocols[protocolId] = protocol;
            localStorage.setItem(this.storageKey, JSON.stringify(protocols));
            
            return protocol;
        } catch (error) {
            console.error('Error loading protocol:', error);
            throw new Error('Failed to load protocol: ' + error.message);
        }
    }
    
    // Delete protocol
    deleteProtocol(protocolId) {
        try {
            const protocols = this.getAllProtocols();
            
            if (!protocols[protocolId]) {
                throw new Error('Protocol not found');
            }
            
            // Check if user can delete
            if (protocols[protocolId].readonly && protocols[protocolId].author !== this.currentUser) {
                throw new Error('Cannot delete readonly protocol');
            }
            
            delete protocols[protocolId];
            localStorage.setItem(this.storageKey, JSON.stringify(protocols));
            
            // Update metadata index
            this.removeFromMetadataIndex(protocolId);
            
            return true;
        } catch (error) {
            console.error('Error deleting protocol:', error);
            throw new Error('Failed to delete protocol: ' + error.message);
        }
    }
    
    // Get all protocols
    getAllProtocols() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || {};
        } catch (error) {
            console.error('Error getting protocols:', error);
            return {};
        }
    }
    
    // Get protocols by user
    getUserProtocols(username = null) {
        const user = username || this.currentUser;
        const allProtocols = this.getAllProtocols();
        
        return Object.values(allProtocols).filter(protocol => 
            protocol.author === user || protocol.shared
        );
    }
    
    // Search protocols
    searchProtocols(query, filters = {}) {
        const allProtocols = Object.values(this.getAllProtocols());
        let results = allProtocols;
        
        // Filter by user access
        results = results.filter(protocol => 
            protocol.author === this.currentUser || protocol.shared
        );
        
        // Text search
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(protocol => 
                protocol.name.toLowerCase().includes(searchTerm) ||
                protocol.description.toLowerCase().includes(searchTerm) ||
                protocol.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filter by category
        if (filters.category) {
            results = results.filter(protocol => protocol.category === filters.category);
        }
        
        // Filter by date range
        if (filters.dateFrom) {
            results = results.filter(protocol => 
                new Date(protocol.created) >= new Date(filters.dateFrom)
            );
        }
        
        if (filters.dateTo) {
            results = results.filter(protocol => 
                new Date(protocol.created) <= new Date(filters.dateTo)
            );
        }
        
        // Sort results
        const sortBy = filters.sortBy || 'modified';
        const sortOrder = filters.sortOrder || 'desc';
        
        results.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            
            if (sortOrder === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
        
        return results;
    }
    
    // Duplicate protocol
    duplicateProtocol(protocolId, newName = null) {
        try {
            const originalProtocol = this.loadProtocol(protocolId);
            
            const duplicatedProtocol = {
                ...originalProtocol,
                name: newName || `${originalProtocol.name} (Copy)`,
                author: this.currentUser,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                readonly: false,
                shared: false
            };
            
            return this.saveProtocol({
                xml: duplicatedProtocol.workspace_xml,
                json: duplicatedProtocol.workspace_json,
                analysis: duplicatedProtocol.analysis
            }, duplicatedProtocol);
        } catch (error) {
            console.error('Error duplicating protocol:', error);
            throw new Error('Failed to duplicate protocol: ' + error.message);
        }
    }
    
    // Export protocol
    exportProtocol(protocolId, format = 'json') {
        try {
            const protocol = this.loadProtocol(protocolId);
            
            const exportData = {
                metadata: {
                    name: protocol.name,
                    description: protocol.description,
                    author: protocol.author,
                    created: protocol.created,
                    version: protocol.version,
                    tags: protocol.tags,
                    category: protocol.category
                },
                workspace: {
                    xml: protocol.workspace_xml,
                    json: protocol.workspace_json
                },
                analysis: protocol.analysis,
                exported: new Date().toISOString(),
                exportFormat: format
            };
            
            const filename = `${protocol.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            
            if (format === 'json') {
                this.downloadJSON(exportData, filename);
            } else if (format === 'xml') {
                this.downloadText(protocol.workspace_xml, filename.replace('.json', '.xml'));
            }
            
            return exportData;
        } catch (error) {
            console.error('Error exporting protocol:', error);
            throw new Error('Failed to export protocol: ' + error.message);
        }
    }
    
    // Import protocol
    importProtocol(fileData, overwriteMetadata = {}) {
        try {
            let protocolData;
            
            if (typeof fileData === 'string') {
                protocolData = JSON.parse(fileData);
            } else {
                protocolData = fileData;
            }
            
            // Validate import data
            if (!protocolData.workspace || !protocolData.workspace.xml) {
                throw new Error('Invalid protocol file: missing workspace data');
            }
            
            const metadata = {
                ...protocolData.metadata,
                ...overwriteMetadata,
                author: this.currentUser,
                imported: new Date().toISOString()
            };
            
            return this.saveProtocol({
                xml: protocolData.workspace.xml,
                json: protocolData.workspace.json,
                analysis: protocolData.analysis
            }, metadata);
        } catch (error) {
            console.error('Error importing protocol:', error);
            throw new Error('Failed to import protocol: ' + error.message);
        }
    }
    
    // Get protocol statistics
    getStorageStats() {
        const protocols = this.getAllProtocols();
        const userProtocols = this.getUserProtocols();
        
        const stats = {
            totalProtocols: Object.keys(protocols).length,
            userProtocols: userProtocols.length,
            sharedProtocols: userProtocols.filter(p => p.shared).length,
            categories: {},
            storageUsed: this.calculateStorageUsed(),
            oldestProtocol: null,
            newestProtocol: null,
            mostUsed: null
        };
        
        // Calculate category distribution
        userProtocols.forEach(protocol => {
            stats.categories[protocol.category] = (stats.categories[protocol.category] || 0) + 1;
        });
        
        // Find oldest and newest protocols
        if (userProtocols.length > 0) {
            const sortedByDate = [...userProtocols].sort((a, b) => 
                new Date(a.created) - new Date(b.created)
            );
            stats.oldestProtocol = sortedByDate[0];
            stats.newestProtocol = sortedByDate[sortedByDate.length - 1];
        }
        
        return stats;
    }
    
    // Helper methods
    generateProtocolId(name) {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const nameSuffix = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        return `protocol_${nameSuffix}_${timestamp}_${randomSuffix}`;
    }
    
    updateMetadataIndex(protocol) {
        try {
            const metadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
            metadata[protocol.id] = {
                name: protocol.name,
                author: protocol.author,
                created: protocol.created,
                modified: protocol.modified,
                category: protocol.category,
                tags: protocol.tags,
                shared: protocol.shared,
                readonly: protocol.readonly
            };
            localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
        } catch (error) {
            console.error('Error updating metadata index:', error);
        }
    }
    
    removeFromMetadataIndex(protocolId) {
        try {
            const metadata = JSON.parse(localStorage.getItem(this.metadataKey)) || {};
            delete metadata[protocolId];
            localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
        } catch (error) {
            console.error('Error removing from metadata index:', error);
        }
    }
    
    calculateStorageUsed() {
        try {
            const protocolData = localStorage.getItem(this.storageKey) || '';
            const metadataData = localStorage.getItem(this.metadataKey) || '';
            return (protocolData.length + metadataData.length) / 1024; // KB
        } catch (error) {
            return 0;
        }
    }
    
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    downloadText(text, filename) {
        const blob = new Blob([text], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Protocol Templates System
class ProtocolTemplates {
    constructor(storage) {
        this.storage = storage;
        this.loadDefaultTemplates();
    }
    
    loadDefaultTemplates() {
        const templates = [
            {
                name: 'DNA Extraction Template',
                description: 'Basic DNA extraction protocol template',
                category: 'Molecular Biology',
                tags: ['DNA', 'extraction', 'template'],
                xml: this.getDNAExtractionTemplate()
            },
            {
                name: 'PCR Amplification Template',
                description: 'Standard PCR protocol template',
                category: 'Molecular Biology',
                tags: ['PCR', 'amplification', 'template'],
                xml: this.getPCRTemplate()
            },
            {
                name: 'Cell Culture Template',
                description: 'Basic cell culture maintenance protocol',
                category: 'Cell Biology',
                tags: ['cell culture', 'maintenance', 'template'],
                xml: this.getCellCultureTemplate()
            }
        ];
        
        templates.forEach(template => {
            const existingTemplates = this.storage.searchProtocols(template.name);
            if (existingTemplates.length === 0) {
                this.storage.saveProtocol(
                    { xml: template.xml },
                    {
                        ...template,
                        readonly: true,
                        shared: true,
                        version: '1.0'
                    }
                );
            }
        });
    }
    
    getDNAExtractionTemplate() {
        return `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="protocol_definition" x="20" y="20">
                <field name="PROTOCOL_NAME">DNA_Extraction_Template</field>
                <field name="DESCRIPTION">Template for DNA extraction protocols</field>
                <statement name="INPUTS">
                    <block type="protocol_input">
                        <field name="INPUT_NAME">sample_type</field>
                        <field name="INPUT_TYPE">SAMPLE</field>
                        <field name="REQUIRED">TRUE</field>
                        <field name="DESCRIPTION">Type of biological sample</field>
                    </block>
                </statement>
                <statement name="STEPS">
                    <block type="sample_variable">
                        <field name="NAME">biological_sample</field>
                        <field name="TYPE">TISSUE</field>
                        <field name="DESCRIPTION">Sample for DNA extraction</field>
                        <next>
                            <block type="preparation_step">
                                <field name="WHAT">sample</field>
                                <field name="METHOD">homogenization</field>
                                <next>
                                    <block type="reagent_variable">
                                        <field name="NAME">lysis_buffer</field>
                                        <field name="DESCRIPTION">Cell lysis buffer</field>
                                        <next>
                                            <block type="mixing_step">
                                                <field name="COMPONENTS">sample with lysis buffer</field>
                                                <field name="METHOD">VORTEX</field>
                                                <next>
                                                    <block type="incubation_step">
                                                        <field name="SAMPLE">lysed sample</field>
                                                        <field name="CONDITIONS">STATIC</field>
                                                        <next>
                                                            <block type="measurement_step">
                                                                <field name="MEASUREMENT_TYPE">ABSORBANCE</field>
                                                                <field name="RESULT_VAR">dna_concentration</field>
                                                            </block>
                                                        </next>
                                                    </block>
                                                </next>
                                            </block>
                                        </next>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </statement>
                <statement name="OUTPUTS">
                    <block type="protocol_output">
                        <field name="OUTPUT_NAME">extracted_dna</field>
                        <field name="OUTPUT_TYPE">SAMPLE</field>
                        <field name="DESCRIPTION">Purified DNA sample</field>
                    </block>
                </statement>
            </block>
        </xml>`;
    }
    
    getPCRTemplate() {
        return `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="protocol_definition" x="20" y="20">
                <field name="PROTOCOL_NAME">PCR_Template</field>
                <field name="DESCRIPTION">Template for PCR amplification protocols</field>
                <statement name="STEPS">
                    <block type="reagent_variable">
                        <field name="NAME">pcr_master_mix</field>
                        <field name="DESCRIPTION">PCR master mix with polymerase</field>
                        <next>
                            <block type="preparation_step">
                                <field name="WHAT">PCR reaction</field>
                                <field name="METHOD">pipetting</field>
                                <next>
                                    <block type="qpcr_system">
                                        <field name="SYSTEM">CFX96</field>
                                        <field name="CHEMISTRY">SYBR</field>
                                        <field name="RESULT_VAR">pcr_results</field>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </statement>
            </block>
        </xml>`;
    }
    
    getCellCultureTemplate() {
        return `<xml xmlns="https://developers.google.com/blockly/xml">
            <block type="protocol_definition" x="20" y="20">
                <field name="PROTOCOL_NAME">Cell_Culture_Template</field>
                <field name="DESCRIPTION">Template for cell culture maintenance</field>
                <statement name="STEPS">
                    <block type="sample_variable">
                        <field name="NAME">cell_culture</field>
                        <field name="TYPE">CELLS</field>
                        <field name="DESCRIPTION">Cultured cells</field>
                        <next>
                            <block type="observation_step">
                                <field name="SAMPLE">cell culture</field>
                                <field name="OBSERVATION">confluency and morphology</field>
                                <field name="RECORD_VAR">culture_status</field>
                                <next>
                                    <block type="incubation_step">
                                        <field name="SAMPLE">cell culture</field>
                                        <field name="CONDITIONS">STATIC</field>
                                    </block>
                                </next>
                            </block>
                        </next>
                    </block>
                </statement>
            </block>
        </xml>`;
    }
}

// Global storage instance
window.protocolStorage = new ProtocolStorage();
window.protocolTemplates = new ProtocolTemplates(window.protocolStorage);