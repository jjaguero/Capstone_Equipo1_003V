import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReportConfig {
    title: string
    subtitle?: string
    orientation?: 'portrait' | 'landscape'
}

interface TableColumn {
    header: string
    dataKey: string
}

export class ReportGenerator {
    private doc: jsPDF
    private pageWidth: number
    private pageHeight: number
    private margin: number = 20
    private currentY: number = 20

    constructor(config: ReportConfig) {
        this.doc = new jsPDF({
            orientation: config.orientation || 'portrait',
            unit: 'mm',
            format: 'a4',
        })

        this.pageWidth = this.doc.internal.pageSize.getWidth()
        this.pageHeight = this.doc.internal.pageSize.getHeight()

        // Header
        this.addHeader(config.title, config.subtitle)
    }

    private addHeader(title: string, subtitle?: string) {
        // Logo/Title
        this.doc.setFontSize(20)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text('AquaTracking', this.margin, this.currentY)

        // Title
        this.currentY += 10
        this.doc.setFontSize(16)
        this.doc.text(title, this.margin, this.currentY)

        // Subtitle
        if (subtitle) {
            this.currentY += 7
            this.doc.setFontSize(10)
            this.doc.setFont('helvetica', 'normal')
            this.doc.setTextColor(100)
            this.doc.text(subtitle, this.margin, this.currentY)
            this.doc.setTextColor(0)
        }

        // Date
        this.doc.setFontSize(9)
        const now = new Date()
        const dateStr = now.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        this.doc.text(`Generado: ${dateStr}`, this.pageWidth - this.margin, 20, {
            align: 'right',
        })

        // Line separator
        this.currentY += 7
        this.doc.setDrawColor(200)
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
        this.currentY += 10
    }

    addSection(title: string) {
        this.currentY += 5
        this.doc.setFontSize(14)
        this.doc.setFont('helvetica', 'bold')
        this.doc.setTextColor(50)
        this.doc.text(title, this.margin, this.currentY)
        this.doc.setTextColor(0)
        this.currentY += 8
    }

    addText(text: string, fontSize: number = 10) {
        this.doc.setFontSize(fontSize)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(text, this.margin, this.currentY)
        this.currentY += 6
    }

    addKeyValue(key: string, value: string | number) {
        this.doc.setFontSize(10)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text(`${key}:`, this.margin, this.currentY)
        this.doc.setFont('helvetica', 'normal')
        this.doc.text(String(value), this.margin + 50, this.currentY)
        this.currentY += 6
    }

    addMetricsGrid(metrics: Array<{ label: string; value: string | number; unit?: string }>) {
        const cols = 2
        const colWidth = (this.pageWidth - 2 * this.margin) / cols
        let col = 0

        metrics.forEach((metric) => {
            const x = this.margin + col * colWidth
            const y = this.currentY

            // Box
            this.doc.setFillColor(245, 245, 245)
            this.doc.rect(x, y - 5, colWidth - 5, 15, 'F')

            // Label
            this.doc.setFontSize(9)
            this.doc.setFont('helvetica', 'normal')
            this.doc.setTextColor(100)
            this.doc.text(metric.label, x + 3, y)

            // Value
            this.doc.setFontSize(14)
            this.doc.setFont('helvetica', 'bold')
            this.doc.setTextColor(0)
            const valueStr = metric.unit ? `${metric.value} ${metric.unit}` : String(metric.value)
            this.doc.text(valueStr, x + 3, y + 7)

            col++
            if (col >= cols) {
                col = 0
                this.currentY += 20
            }
        })

        if (col > 0) {
            this.currentY += 20
        }

        this.doc.setTextColor(0)
    }

    addTable(columns: TableColumn[], data: any[], options?: any) {
        autoTable(this.doc, {
            startY: this.currentY,
            head: [columns.map((col) => col.header)],
            body: data.map((row) => columns.map((col) => row[col.dataKey] || '-')),
            margin: { left: this.margin, right: this.margin },
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [79, 70, 229], // indigo-600
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251],
            },
            ...options,
        })

        // @ts-ignore
        this.currentY = this.doc.lastAutoTable.finalY + 10
    }

    addSpacer(height: number = 10) {
        this.currentY += height
    }

    checkPageBreak(requiredSpace: number = 40) {
        if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
            this.doc.addPage()
            this.currentY = this.margin
            return true
        }
        return false
    }

    addPageNumber() {
        const pageCount = this.doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i)
            this.doc.setFontSize(8)
            this.doc.setTextColor(150)
            this.doc.text(
                `Página ${i} de ${pageCount}`,
                this.pageWidth / 2,
                this.pageHeight - 10,
                { align: 'center' }
            )
        }
        this.doc.setTextColor(0)
    }

    save(filename: string) {
        this.addPageNumber()
        this.doc.save(filename)
    }

    getBlob(): Blob {
        this.addPageNumber()
        return this.doc.output('blob')
    }
}

// Export utility function for CSV
export const exportToCSV = (data: any[], filename: string, columns?: string[]) => {
    if (data.length === 0) return

    const headers = columns || Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map((row) =>
            headers.map((header) => {
                const value = row[header]
                // Handle commas and quotes in values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`
                }
                return value || ''
            }).join(',')
        ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
