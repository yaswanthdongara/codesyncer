/*
Title: Download_pdf_2026-01-30T01-59-53-915Z.js
Description: 
Date: 1/30/2026, 7:29:53 AM
*/

&lt;button onclick="downloadPDF()"&gt;Download PDF&lt;/button&gt;<div><br></div><div>&lt;script&gt;</div><div>function downloadPDF() {</div><div>  const link = document.createElement("a");</div><div>  link.href = "sample.pdf";</div><div>  link.download = "sample.pdf";</div><div>  document.body.appendChild(link);</div><div>  link.click();</div><div>  document.body.removeChild(link);</div><div>}</div><div>&lt;/script&gt;</div>