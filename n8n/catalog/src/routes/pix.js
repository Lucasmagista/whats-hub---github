const express = require('express');
const { PaymentProof, Order, Customer } = require('../models');
const router = express.Router();
const tesseract = require('node-tesseract-ocr');
const axios = require('axios');

// Validação avançada do comprovante PIX
router.post('/validate', async (req, res) => {
  try {
    const { orderId, imageUrl } = req.body;
    if (!orderId || !imageUrl) return res.status(400).json({ error: 'orderId e imageUrl obrigatórios' });
    const order = await Order.findByPk(orderId, { include: Customer });
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    // Baixa a imagem
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    // Salva temporariamente
    const tempPath = `/tmp/pix-${orderId}-${Date.now()}.jpg`;
    require('fs').writeFileSync(tempPath, buffer);
    // OCR
    let ocrText = '';
    try {
      ocrText = await tesseract.recognize(tempPath, { lang: 'por' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro no OCR', details: err.message });
    }
    // Regex para valor, data/hora, nome, agendamento
    const valorMatch = ocrText.match(/valor\s*:?.*?R?\$?\s*([\d.,]+)/i);
    const dataMatch = ocrText.match(/(\d{2}\/\d{2}\/\d{4})[\s-]+(\d{2}:\d{2})/);
    const nomeMatch = ocrText.match(/pagador\s*:?\s*([\w\s]+)/i);
    const agendado = /agendado/i.test(ocrText);
    // Validações
    let status = 'valid';
    let motivos = [];
    // Valor
    const valorPedido = parseFloat(order.total);
    const valorDetectado = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    if (!valorDetectado || Math.abs(valorDetectado - valorPedido) > 0.5) {
      status = 'invalid';
      motivos.push('Valor divergente');
    }
    // Data/hora
    const dataDetectada = dataMatch ? `${dataMatch[1]} ${dataMatch[2]}` : null;
    // Nome
    const nomeDetectado = nomeMatch ? nomeMatch[1].trim() : null;
    if (nomeDetectado && order.Customer && order.Customer.name) {
      const nomePedido = order.Customer.name.split(' ')[0].toLowerCase();
      if (!nomeDetectado.toLowerCase().includes(nomePedido)) {
        status = 'invalid';
        motivos.push('Nome do pagador diferente do pedido');
      }
    }
    // Agendamento
    if (agendado) {
      status = 'invalid';
      motivos.push('PIX agendado não permitido');
    }
    // Atualiza PaymentProof
    await PaymentProof.upsert({
      orderId,
      imageUrl,
      status,
      detectedValue: valorDetectado,
      detectedTime: dataDetectada,
      detectedName: nomeDetectado,
      isScheduled: agendado
    });
    res.json({ status, motivos, valorDetectado, dataDetectada, nomeDetectado, agendado, ocrText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
