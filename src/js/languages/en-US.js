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



    // Validation rules
    validationRules: {
        header: "PDF Header Validation",
        headerDesc: [
            "Check if %PDF identifier exists",
            "Validate version number format (1.0-1.7)",
            "Check file type identifier"
        ],
        catalog: "Catalog Object Validation",
        catalogDesc: [
            "Verify Type property must be \"Catalog\"",
            "Check required entries: Pages",
            "Validate object reference validity"
        ],
        pages: "Pages Object Validation",
        pagesDesc: [
            "Verify Type property must be \"Pages\"",
            "Check required entries: Kids, Count",
            "Validate page tree structure integrity"
        ],
        page: "Page Object Validation",
        pageDesc: [
            "Verify Type property must be \"Page\"",
            "Check required entries: Parent, MediaBox",
            "Validate page boundary box validity"
        ],
        font: "Font Object Validation",
        fontDesc: [
            "Verify Type property must be \"Font\"",
            "Check required entries: Subtype, BaseFont",
            "Validate font type and encoding"
        ],
        xobject: "XObject Object Validation",
        xobjectDesc: [
            "Verify Type property must be \"XObject\"",
            "Check required entries: Subtype",
            "Validate image or form object properties"
        ],
        stream: "Stream Object Validation",
        streamDesc: [
            "Check Length property",
            "Validate Filter property validity",
            "Check compressed data integrity"
        ],
        xref: "XRef Table Validation",
        xrefDesc: [
            "Check XRef table integrity",
            "Validate object offset correctness",
            "Check generation number validity"
        ],
        trailer: "Trailer Validation",
        trailerDesc: [
            "Check required properties: Root, Size",
            "Validate Root reference validity",
            "Check encryption status information"
        ],
        reference: "Reference Relationship Validation",
        referenceDesc: [
            "Check indirect reference validity",
            "Validate object number range",
            "Detect circular reference relationships"
        ],
        security: "Security Validation",
        securityDesc: [
            "Check encryption status",
            "Validate permission settings",
            "Detect security risks"
        ],
        performance: "Performance Validation",
        performanceDesc: [
            "Check object count reasonableness",
            "Validate file size",
            "Detect memory usage"
        ]
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
        back: "Home",
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
    },

    // Help page
    help: {
        title: "Help Center",
        uploadTitle: "File Upload",
        uploadDesc: "Click the \"Select File\" button to choose a PDF file, or drag and drop PDF files directly to the upload area. Supported file size: maximum 50MB",
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
            description: "PDF Inspector Pro is a powerful PDF document analysis tool that helps you deeply understand PDF file structure, verify file integrity, and discover potential issues.",
            featuresTitle: "Supported features include:",
            featuresItems: [
                "PDF structure parsing and visualization",
                "File integrity validation",
                "Security risk detection",
                "Performance analysis",
                "Batch processing"
            ]
        },
        rules: {
            title: "PDF Validation Rules",
            description: "This tool validates based on PDF 1.7 standard (ISO 32000-1) and includes the following 12 main validation categories:"
        },
        analysisTitle: "View Analysis Results",
        analysisDesc: "After uploading, the system will automatically analyze the PDF structure, display file information, security status, and validation results.",
        exportTitle: "Export Results",
        exportDesc: "Click the export button to download the analysis report, including detailed PDF structure information.",
        faqTitle: "FAQ",
        faqItems: [
            "File too large: Please ensure PDF files are less than 50MB",
            "Unsupported format: Only standard PDF format is supported",
            "Analysis failed: Please check if the file is corrupted",
            "Browser compatibility: Recommended to use modern browsers like Chrome, Firefox, Safari",
            "Network issues: Ensure stable network connection"
        ],
        tipsTitle: "Usage Tips",
        tipsItems: [
            "Drag and drop: Directly drag PDF files to the upload area",
            "Batch processing: Can only process one file at a time, but can process multiple files consecutively",
            "Result export: Can export detailed reports after analysis is complete",
            "Security detection: System will automatically detect security risks in PDFs"
        ]
    },

    // About page
    about: {
        title: "About Us",
        introTitle: "Project Introduction",
        introDesc: "PDF Inspector Pro is a professional PDF format validation tool developed based on PDF 1.7 standard, providing comprehensive PDF file analysis and validation functions.",
        featuresTitle: "Core Features",
        featuresItems: [
            "PDF structure parsing and visualization",
            "Format standard validation",
            "Security risk assessment",
            "Issue detection and reporting",
            "Drag and drop upload support"
        ],
        techTitle: "Technical Features",
        techItems: [
            "Based on PDF 1.7 standard",
            "Pure frontend implementation, protecting privacy",
            "Real-time analysis processing",
            "Responsive design"
        ],
        stackTitle: "Technology Stack",
        stackDesc: "HTML5, CSS3, JavaScript, D3.js, Font Awesome",
        teamTitle: "Development Team",
        teamDesc: "PDF Inspector Pro is developed by a professional PDF format validation team, committed to providing users with high-quality PDF analysis tools.",
        contributeTitle: "Open Source Contribution",
        contributeDesc: "We welcome community contributions. If you find bugs or have improvement suggestions, please contact us."
    },

    // Privacy policy page
    privacy: {
        title: "Privacy Policy",
        collectionTitle: "Information Collection",
        collectionDesc: "PDF Inspector Pro does not collect or store your personal information. All file processing is done locally in your browser and will not be uploaded to any server.",
        securityTitle: "Data Security",
        securityDesc: "Your PDF files are processed locally only and will not be transmitted to any external servers. We use pure frontend technology to ensure your file security.",
        cookieTitle: "Cookie Usage",
        cookieDesc: "This website may use necessary cookies to improve user experience, but will not be used for tracking or collecting personal information.",
        linksTitle: "External Links",
        linksDesc: "This website may contain links to external websites. We are not responsible for the privacy policies of these websites.",
        updateTitle: "Policy Updates",
        updateDesc: "This privacy policy may be updated, and updated policies will be published on this page.",
        protectionTitle: "Data Protection",
        protectionDesc: "We adopt industry-standard security measures to protect your data, including encrypted transmission and secure storage practices.",
        thirdPartyTitle: "Third-party Services",
        thirdPartyDesc: "We will not share your personal information with third parties unless required by law or with your explicit consent."
    },

    // Terms of service page
    terms: {
        title: "Terms of Service",
        serviceTitle: "Service Description",
        serviceDesc: "PDF Inspector Pro provides free PDF format validation services, conducting file analysis and validation based on PDF 1.7 standard.",
        userTitle: "User Responsibilities",
        userItems: [
            "Ensure uploaded files are legally owned PDF files",
            "Comply with relevant laws and regulations",
            "Do not abuse service resources"
        ],
        disclaimerTitle: "Disclaimer",
        disclaimerDesc: "This service is provided 'as is' and does not guarantee the accuracy of results. Users should bear the risks of use themselves.",
        prohibitedTitle: "Prohibited Actions",
        prohibitedItems: [
            "Upload malicious files or viruses",
            "Conduct malicious attacks or damage services",
            "Infringe on others' intellectual property rights"
        ],
        updateTitle: "Terms Updates",
        updateDesc: "These terms of service may be updated, and updated terms will be published on this page.",
        legalTitle: "Legal Terms",
        legalDesc: "Using this service indicates your agreement to comply with all applicable laws and regulations and bear corresponding legal responsibilities.",
        disputeTitle: "Dispute Resolution",
        disputeDesc: "If disputes arise, we will prioritize resolution through friendly negotiation. If negotiation fails, we will handle it according to relevant legal procedures."
    }
};

export default enUS; 