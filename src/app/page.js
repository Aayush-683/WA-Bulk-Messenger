"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [numbers, setNumbers] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [variables, setVariables] = useState([]);
  const [headerVariables, setHeaderVariables] = useState([]);
  const [headerUpload, setHeaderUpload] = useState(false);
  const [headerFile, setHeaderFile] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [templateBodyText, setTemplateBodyText] = useState('');
  const [templateHeaderText, setTemplateHeaderText] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else {
      const fetchTemplates = async () => {
        const response = await axios.get('/api/getTemplates');
        setTemplates(response.data);
      };
      fetchTemplates();
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-2xl">Loading...</p>
      </div>
    )
  }

  const handleTemplateChange = (e) => {
    const selected = templates.find(t => t.name === e.target.value);
    if (!selected) {
      setVariables([]);
      setHeaderVariables([]);
      setHeaderUpload(false);
      setInputValues({});
      setTemplateBodyText('');
      setTemplateHeaderText('');
      return;
    }
    setSelectedTemplate(selected);
    setVariables(selected.components
      .filter(comp => comp.type === 'BODY' && comp.text.includes('{{')) // Get only components with variables
      .flatMap(comp => comp.text.match(/{{\d+}}/g)) // Extract variable placeholders
    );
    let header = selected.components.filter(comp => comp.type === 'HEADER');
    if (header.length !== 0) {
      let format = header[0].format;
      if (format === "TEXT") {
        // If it is text, then extract variables
        setHeaderVariables(selected.components
          .filter(comp => comp.type === 'HEADER' && comp.format === "TEXT" && comp.text.includes('{{')) // Get only components with variables
          .flatMap(comp => comp.text.match(/{{\d+}}/g)) // Extract variable placeholders
        );
        setHeaderUpload(false);
      } else {
        // If it is document/image, then allow user to upload file
        setHeaderVariables([]);
        setHeaderUpload(true);
      }
    } else {
      setHeaderVariables([]);
      setHeaderUpload(false);
    }
    setInputValues({}); // Reset input values when template changes
    setTemplateBodyText(getTemplateBodyText(selected));
    setTemplateHeaderText(getTemplateHeaderText(selected));
  };

  const getTemplateBodyText = (template) => {
    return template.components
      .filter(comp => comp.type === 'BODY' || comp.type === 'HEADER' || comp.type === 'FOOTER')
      .map(comp => comp.text)
      .join('\n'); // Combine body, header, and footer text for display
  };

  const getTemplateHeaderText = (template) => {
    return template.components
      .filter(comp => comp.type === 'HEADER')
      .map(comp => `[${comp.format}]` + '\n' + (comp.text ? comp.text : ''))
      .join('\n'); // Combine header text for display
  }

  const handleInputChange = (index, value) => {
    setInputValues(prev => ({ ...prev, [index]: value }));
  };

  const handleFileChange = async () => {
    let fileInput = document.querySelector('input[type="file"]');
    let file = fileInput.files[0]; // Get the selected file

    // Check if a file is selected
    if (!file) {
      console.error('No file selected.');
      return;
    }

    // Create a FormData object to send the file
    let formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type);
    formData.append('name', file.name);

    // Disable the button while uploading
    let uploadButton = document.getElementById('uploadFile');
    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading...';

    let sendButton = document.getElementById('sendMsg');
    sendButton.disabled = true;

    try {
      let response = await axios.post('/api/uploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setHeaderFile(response.data.file);
      uploadButton.textContent = 'File Uploaded!';
      sendButton.disabled = false;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file.');
    }
  }



  const handleSendMessage = async () => {
    const filledVariables = variables.map((_, index) => inputValues[index] || '');
    const filledHeaderVariables = headerVariables.map((_, index) => inputValues[index] || '');

    const payload = {
      numbers: numbers.split(',').map(n => n.trim()),
      templateName: selectedTemplate.name,
      variables: filledVariables,
      variablesHeader: filledHeaderVariables,
      language: selectedTemplate.language,
      hasDocument: headerUpload,
      headerFile: headerFile,
    };

    try {
      await axios.post('/api/sendMessage', payload);
      alert('Messages sent successfully!');
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('Failed to send messages.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Send WhatsApp Template Messages</h1>
          {session !== null && (
            <div className='mb-6 flex flex-row items-center gap-5'>
              <h2 className="text-base font-normal">Logged in as: {session.user.email}</h2>
              <button className="bg-red-500 text-white p-2 rounded" onClick={() => signOut()}>Sign Out</button>
            </div>
          )}
          {/* Input for phone numbers */}
          <div className="mb-4">
            <label htmlFor="numbers" className="block text-sm font-medium">
              Phone Numbers (comma separated):
            </label>
            <input
              type="text"
              id="numbers"
              className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              placeholder="+1234567890, +1987654321"
            />
          </div>

          {/* Template selection */}
          <div className="mb-4">
            <label htmlFor="template" className="block text-sm font-medium">
              Select Template:
              {/* <button onClick={refreshTemplates} className="bg-blue-500 text-white p-2 rounded ml-2">Refresh</button> */}
            </label>
            <select
              id="template"
              className="w-full p-2 mt-1 bg-white text-black rounded"
              onChange={handleTemplateChange}
            >
              <option value="">-- Select Template --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Header Variable inputs based on template */}
          {headerVariables.length > 0 && !headerUpload && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">Template Header Variables:</h2>
              {headerVariables.map((variable, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-sm font-medium">
                    Variable {index + 1}:
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
                    placeholder={`Enter value for ${variable}`}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Header File input based on template */}
          {headerUpload && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">Template Header File:</h2>
              <input
                type="file"
                className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
              />
              <button id="uploadFile" onClick={() => handleFileChange()} className="w-full bg-blue-500 text-white p-3 rounded mt-4">
                Upload File
              </button>
            </div>
          )}

          {/* Body Variable inputs based on template */}
          {variables.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xl font-bold">Template Body Variables:</h2>
              {variables.map((variable, index) => (
                <div key={index} className="mb-2">
                  <label className="block text-sm font-medium">
                    Variable {index + 1}:
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 mt-1 bg-gray-800 text-white rounded"
                    placeholder={`Enter value for ${variable}`}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Send button */}
          <button
            className="w-full bg-blue-500 text-white p-3 rounded mt-4"
            id="sendMsg"
            onClick={handleSendMessage}
          >
            Send Message
          </button>
        </div>

        {/* Template body preview for context */}
        <div className="bg-gray-800 p-6 rounded">
          <h2 className="text-xl font-bold mb-4">Template Preview</h2>
          {templateHeaderText && (
            <div>
              <h2 className="text-xl font-bold">Template Header:</h2>
              <pre className="text-white text-pretty">{templateHeaderText}</pre>
              <hr className="my-4 border-gray-700" />
            </div>
          )}
          {templateBodyText && (
            <div>
              <h2 className="text-xl font-bold">Template Body:</h2>
              <pre className="text-white text-pretty">{templateBodyText}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
