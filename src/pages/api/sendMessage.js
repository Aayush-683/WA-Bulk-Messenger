import axios from 'axios';

const sendMessage = async (req, res) => {
  const { numbers, templateName, variables, variablesHeader, language, hasDocument, headerFile } = req.body;

  const businessNumberId = process.env.BUSINESS_NUMBER_ID;
  const accessToken = process.env.META_API_KEY; 

  let headerComponent

  if (hasDocument) {
    let name = headerFile.name
    let path = headerFile.path
    let type = 'document'
    // If extension is jpg, jpeg, or png, then it's an image
    if (path.match(/\.(jpg|jpeg|png)$/)) {
      type = 'image';
    }
    headerComponent = {
      type: "header",
      parameters: [
        {
          "type": `${type}`
        }
      ]
    }
    headerComponent.parameters[0][type] = {
      link: `https://localhost:3000/uploads/${name}`
    }
  } else if (variablesHeader.length > 0) {
    headerComponent = {
      type: 'header',
      parameters: variablesHeader.map((variable) => ({
        type: 'text',
        text: variable
      }))
    }
  } else {
    headerComponent = false;
  }

  try {
    const sendToAll = numbers.map(async (number) => {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: number,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: language
          },
          components: [
            {
              type: 'body',
              parameters: variables.map((variable) => ({
                type: 'text',
                text: variable
              }))
            }
          ]
        }
      };

      if (headerComponent) {
        payload.template.components.unshift(headerComponent);
      }

      // Send the request to WhatsApp API
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${businessNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    });

    // Wait for all messages to be sent
    const results = await Promise.all(sendToAll);
    // Return success response
    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || 'Failed to send messages'
    });
  }
};

export default sendMessage;
