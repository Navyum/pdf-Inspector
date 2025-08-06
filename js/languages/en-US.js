/**
 * English Language Pack
 * 英文语言包
 */
const enUS = {
    // App title and description
    app: {
        title: "PDF Inspector Pro",
        subtitle: "Professional PDF Format Validation Tool",
        description: "A professional PDF format validation tool based on PDF 1.7 standard, providing visual structure analysis, issue detection, and security risk assessment."
    },

    // Header navigation
    header: {
        currentFile: "No file selected",
        processingStatus: "Ready",
        clear: "Clear",
        export: "Export",
        help: "Help"
    },

    // Upload area
    upload: {
        title: "Drag and drop PDF file here or click to select",
        subtitle: "Single file upload supported",
        selectFile: "Select File",
        dragDrop: "Drag and drop PDF file here or click to select",
        supportedSize: "Supported file size: Maximum 50MB",
        processing: "Processing PDF file",
        parsing: "Parsing...",
        processedCount: "Processed",
        totalCount: "Total"
    },

    // File information
    fileInfo: {
        title: "File Information",
        fileName: "File Name",
        fileSize: "File Size",
        pdfVersion: "PDF Version",
        pageCount: "Page Count",
        encryptionStatus: "Encryption Status",
        encrypted: "Encrypted",
        notEncrypted: "Not Encrypted",
        basicInfo: "Basic Information",
        structureInfo: "Structure Information",
        securityInfo: "Security Information",
        validationInfo: "Validation Results",
        objectCount: "Object Count",
        validationStatus: "Validation Status",
        errorCount: "Error Count",
        warningCount: "Warning Count",
        hasJavaScript: "JavaScript",
        hasExternalLinks: "External Links",
        hasEmbeddedFiles: "Embedded Files"
    },

    // Statistics
    stats: {
        avgObjectSize: "Average Object Size",
        objectTypes: "Object Types",
        compressionRatio: "Compression Ratio",
        files: "files"
    },

    // Progress information
    progress: {
        processing: "Processing PDF file",
        parsing: "Parsing...",
        processedCount: "Processed",
        totalCount: "Total"
    },

    // Filter buttons
    filters: {
        all: "All",
        error: "Error",
        warning: "Warning",
        success: "Success"
    },

    // Toolbar buttons
    toolbar: {
        zoomIn: "Zoom In",
        zoomOut: "Zoom Out",
        resetZoom: "Reset Zoom",
        exportImage: "Export Image",
        filter: "Filter",
        exportReport: "Export Report",
        copy: "Copy",
        format: "Format",
        download: "Download"
    },

    // Validation results
    validation: {
        title: "Validation Results",
        passed: "Passed",
        failed: "Failed",
        notVerified: "Not Verified",
        warning: "Warning",
        error: "Error",
        critical: "Critical",
        info: "Info",
        success: "Success",
        noErrors: "No Errors",
        noWarnings: "No Warnings",
        totalIssues: "Total Issues",
        validationPassed: "Validation Passed",
        validationFailed: "Validation Failed"
    },

    // Tabs
    tabs: {
        structure: "Structure Tree",
        graph: "Relationship Graph",
        issues: "Issue List",
        analysis: "Analysis Report",
        raw: "Raw Data"
    },

    // Structure tree
    structure: {
        search: "Search objects...",
        filter: "Filter",
        view: "View",
        expandAll: "Expand All",
        collapseAll: "Collapse All",
        showErrors: "Show Errors",
        showWarnings: "Show Warnings",
        showInfo: "Show Info"
    },

    // Relationship graph
    graph: {
        title: "Object Relationship Graph",
        zoomIn: "Zoom In",
        zoomOut: "Zoom Out",
        reset: "Reset",
        fitToScreen: "Fit to Screen",
        showLabels: "Show Labels",
        hideLabels: "Hide Labels"
    },

    // Issue list
    issues: {
        title: "Issue List",
        level: "Level",
        location: "Location",
        description: "Description",
        noIssues: "No issues found",
        filterByLevel: "Filter by Level",
        all: "All",
        error: "Error",
        warning: "Warning",
        info: "Info"
    },

    // Analysis report
    analysis: {
        title: "Analysis Report",
        overview: "Overview",
        statistics: "Statistics",
        security: "Security Analysis",
        performance: "Performance Analysis",
        objects: "Object Statistics",
        streams: "Stream Objects",
        references: "Reference Relationships"
    },

    // Raw data
    raw: {
        title: "Raw Data",
        copy: "Copy",
        format: "Format",
        download: "Download",
        rawData: "Raw Data"
    },

    // Help content
    help: {
        title: "Help Center",
        upload: {
            title: "File Upload",
            description: "Support drag and drop upload and click to select PDF files"
        },
        features: {
            title: "Feature Description",
            structure: "Structure Tree: Display the complete object structure of PDF documents",
            graph: "Relationship Graph: Visualize reference relationships between objects",
            issues: "Issue List: Display validation issues and warnings",
            analysis: "Analysis Report: Detailed PDF analysis and statistical information",
            raw: "Raw Data: View the original parsed data of PDF"
        },
        about: {
            title: "About Tool",
            description: "PDF Inspector Pro is a powerful PDF document analysis tool that helps you deeply understand PDF file structure, verify file integrity, and discover potential issues."
        },
        rules: {
            title: "PDF Validation Rules",
            description: "This tool validates based on PDF 1.7 standard (ISO 32000-1) and includes the following 12 main validation categories:"
        }
    },

    // Validation rules
    validationRules: {
        header: "PDF Header Validation",
        catalog: "Catalog Object Validation",
        pages: "Pages Object Validation",
        page: "Page Object Validation",
        font: "Font Object Validation",
        xobject: "XObject Object Validation",
        stream: "Stream Object Validation",
        xref: "XRef Table Validation",
        trailer: "Trailer Validation",
        reference: "Reference Relationship Validation",
        security: "Security Validation",
        performance: "Performance Validation"
    },

    // Footer
    footer: {
        features: "Features",
        support: "Technical Support",
        contact: "Contact Us",
        copyright: "© 2024 PDF Inspector Pro. All rights reserved.",
        description: "Professional PDF format validation tool based on PDF 1.7 standard",
        pdfStructureAnalysis: "PDF Structure Analysis",
        formatValidation: "Format Standard Validation",
        issueDetection: "Issue Detection",
        securityAssessment: "Security Risk Assessment",
        helpDocs: "Help Documentation",
        aboutUs: "About Us",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        emailSupport: "Email Support"
    },

    // Modal
    modal: {
        objectDetail: "Object Details",
        close: "Close"
    },

    // Common
    common: {
        loading: "Loading...",
        error: "Error",
        success: "Success",
        warning: "Warning",
        info: "Info",
        close: "Close",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        refresh: "Refresh",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        export: "Export",
        import: "Import",
        download: "Download",
        upload: "Upload",
        yes: "Yes",
        no: "No",
        ok: "OK",
        back: "Back",
        next: "Next",
        previous: "Previous",
        finish: "Finish"
    },

    // Error messages
    errors: {
        d3LoadFailed: "D3.js library failed to load, cannot display relationship graph",
        fileLoadFailed: "File load failed",
        parsingFailed: "Parsing failed",
        validationFailed: "Validation failed"
    },

    // Graph related
    graph: {
        noRelationships: "No object relationships found",
        title: "Object Relationship Graph",
        zoomIn: "Zoom In",
        zoomOut: "Zoom Out",
        reset: "Reset",
        fitToScreen: "Fit to Screen",
        showLabels: "Show Labels",
        hideLabels: "Hide Labels"
    }
};

export default enUS; 