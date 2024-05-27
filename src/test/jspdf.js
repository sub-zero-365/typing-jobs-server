
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import fs from "fs"
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const filepath = path.resolve(__dirname, "./logo.png");
function generateInvoice() {
    const customerNames = ["John Doe", "Jane Smith", "Alice Walker"];
    const productNames = ["Laptop", "Phone", "Headphones"];
    const prices = [1000, 500, 100];
    const quantities = [1, 2, 3];
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const products = [];
    for (let i = 0; i < 10; i++) { // Generate random number of products (1-3)
        const index = Math.floor(Math.random() * productNames.length);
        products.push({
            name: productNames[index],
            price: prices[index],
            quantity: quantities[Math.floor(Math.random() * 2) + 1], // Generate random quantity (1-5)
        });
    }

    const subtotal = products.reduce((acc, product) => acc + (product.price * product.quantity), 0);
    const taxRate = 0.07; // Assuming 7% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
        customerName,
        products,
        subtotal,
        taxRate,
        tax,
        total,
    };
}

// Generate a random invoice object
const invoice = generateInvoice();

// Function to create the PDF with image and table
async function createInvoicePDF(invoice) {
    const WIDTH = 10, HEIGHT = 10, OFFSET = 14
    let format = 'PNG'
    var imgData = await fs.readFileSync(filepath).toString('base64');
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });
    doc.addImage(imgData, format, OFFSET, 0, WIDTH, HEIGHT)
    const bgColor = [40, 31, 51];
    doc.setFontSize(15);
    doc.setTextColor("red")

    doc.text(
        `EASY GOODS AND SERVICES`,
        WIDTH + 5 + OFFSET,
        HEIGHT - 1.5,
        { renderingMode: "stroke" },

    );
    doc.setFontSize(30);
    doc.setTextColor("red")
    doc.text(
        `INVOICE`,
        doc.internal.pageSize.width - OFFSET,
        HEIGHT - 1 + 10,
        { align: "right" }
    );
    // const pagesCount = doc.internal.getNumberOfPages();
    const totalPages = doc.getNumberOfPages();
    // Add image (replace 'path/to/your/image.png' with the actual path)
    // const dataUri = await imageDataURI.encodeFromFile(filepath);

    // Add title
    doc.setFontSize(20);
    doc.text("Invoice", doc.internal.pageSize.getWidth() / 2, 50, "center");
    // doc.addImage(dataUri, 'PNG', 10, 20, 180, 160); // Adjust the position and size as needed

    // Generate table data
    const tableData = [
        ["Customer Name:", invoice.customerName],
        ["", ""], // Empty row for spacing
        ["Product", "Price", "Quantity", "Total"],
        ...invoice.products.map((product) => [product.name, product.price, product.quantity, product.price * product.quantity]),
        // ["Subtotal", invoice.subtotal.toFixed(2)],
        // ["Tax Rate", (invoice.taxRate * 100) + "%"],
        // ["Tax", invoice.tax.toFixed(2)],
        // ["Total", invoice.total.toFixed(2)],
    ];

    // Add table
    let currentPage = 1; // Reference to the current page

    doc.autoTable({
        startY: HEIGHT + 10, // Start table after image and title
        head: [tableData[2]], // Header row
        body: tableData.slice(3), // Table body excluding header and empty row

        headStyles: { fillColor: bgColor, textColor: [255, 255, 255] },

        // bodyStyles: { fillColor: [...bgColor,0.1] },


        styles: {
            textColor: [0, 0, 0],
            halign: "left",
            valign: "middle",
            minCellHeight: 13
        },
        didDrawCell: (data) => {
            const { doc, cell } = data;
            const { row } = data.cell;
            const startX = cell.x;
            const startY = cell.y + cell.height;
            doc.setDrawColor(40, 31, 51);
            doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);

        },
        didDrawPage: (data) => {
            // Add logo to each page
            console.log(data.pageCount, totalPages, doc.getNumberOfPages(), doc.internal.getNumberOfPages())
            doc.setFontSize(10).setFillColor("black");
            doc.addImage(imgData, format, OFFSET, doc.internal.pageSize.height - HEIGHT, WIDTH + 10, HEIGHT);
            if (data.page !== totalPages) {
                // Add logo to each page except the last one
                doc.text(
                    `email: rosemary@gmail.com`,
                    doc.internal.pageSize.width - OFFSET,
                    doc.internal.pageSize.height - 5,
                    { align: "right" }
                );
            }


            currentPage++;
        }
    });
    // startY: pdf.autoTable.previous.finalY + 10,
    doc.setFontSize(10);
    doc.setTextColor("red")
    doc.text(
        `USER INFORMATION`,
        OFFSET,
        doc.autoTable.previous.finalY + 20,
        { align: "left" }
    );
    doc.setFontSize(10);
    doc.setTextColor("black")
    doc.text(
        `FullName: Rose Mary`,
        OFFSET,
        doc.autoTable.previous.finalY + 20 + 4,
        { align: "left" }
    );
    doc.text(
        `Phone: 670000002`,
        OFFSET,
        doc.autoTable.previous.finalY + 20 + 4 + 4,
        { align: "left" }
    );
    doc.text(
        `email Address: rosemary@gmail.com`,
        OFFSET,
        doc.autoTable.previous.finalY + 20 + 4 + 4 + 4,
        { align: "left" }
    );
    doc.addImage(imgData, format, OFFSET, doc.autoTable.previous.finalY + 20 + 4 + 4 + 4 + 4, WIDTH + 5, HEIGHT + 5)
    doc.setTextColor("red")
    doc.text(
        `PAYMENT INFORMATION`,
        doc.internal.pageSize.width - OFFSET,
        doc.autoTable.previous.finalY + 20,
        { align: "right" }
    );
    doc.setTextColor("black")
    doc.text(
        `FullName: Fred Morgan`,
        doc.internal.pageSize.width - OFFSET,
        doc.autoTable.previous.finalY + 20 + 4,
        { align: "right" }
    );
    doc.text(
        `FullName: Fred Morgan`,
        doc.internal.pageSize.width - OFFSET,
        doc.autoTable.previous.finalY + 20 + 4 + 5,
        { align: "right" }
    );
    // Save the PDF
    doc.save("invoice.pdf");
}

// Generate and create PDF
createInvoicePDF(invoice);

console.log("Invoice PDF created successfully!");
