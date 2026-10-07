# ScanIT QR Generator

A lightweight, client-side website QR generator. Enter a company name and website address, then generate a QR code that directly encodes the normalized destination URL.

## Use

Open `index.html` in a modern browser. Enter details, select **Generate QR code**, then download the PNG or copy the normalized link.

## Notes

- No accounts, backend, database, API keys, or stored data.
- URLs without a protocol are normalized to `https://`.
- QR rendering uses the open-source QRCode.js browser library, loaded from cdnjs.
