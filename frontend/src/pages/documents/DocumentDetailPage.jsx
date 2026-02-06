
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tabs from "../../components/common/Tabs";

const DocumentDetailPage = () => {
  const { id } = useParams();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocumentData(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocumentDetails();
    }
  }, [id]);

  const getPdfUrl = () => {
    if (!documentData?.data?.filePath) return null;

    const filePath = documentData.data.filePath;

    // If already a full URL
    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return filePath;
    }

    const baseUrl =
      process.env.REACT_APP_API_URL || "http://localhost:8000";

    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (!documentData?.data?.filePath) {
      return <div>PDF not available.</div>;
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-lg">Document Viewer</span>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>

        <div className="w-full h-[80vh] border rounded">
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            className="w-full h-full"
            frameBorder="0"
            style={{ colorScheme: "light" }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface/>
  };

  const renderAIActions = () => {
    return <AIAction />
  };
  
  const renderFlashcardsTab = () => {
    return "renderFlashcardsTab"
  };

  const renderQuizzesTab = () => {
    return "renderQuizzesTab"
  };

  const tabs = [
    {name: 'Content', label:'Content',content:renderContent()},
    {name: 'Chat', label:'Chat',content:renderChat()},
    {name: 'AI Actions', label:'AI Actions',content:renderAIActions()},
    {name: 'Flashcards', label:'Flashcards',content:renderFlashcardsTab()},
    {name: 'Quizzes', label:'Quizzes',content:renderQuizzesTab()},
  ];

  if(loading){
    return <Spinner/>;
  }

  if(!document){
    return <div className="">Document not found.</div>
  }
  
  return (
    <div>
        <div className="mb-4">
            <Link to="/documents" className="inline">
            <ArrowLeft size={16}/>
            Back to Documents
            </Link>
            <div>
                <PageHeader title={document.data.title}/>
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
            </div>
        </div>
    </div>
   
  );
};

export default DocumentDetailPage
 