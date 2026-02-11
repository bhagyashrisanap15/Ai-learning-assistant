import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Flashcard from "./Flashcard";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  /* ================= FETCH ================= */
  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response =
        await flashcardService.getFlashcardsForDocument(
          documentId
        );
      setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) fetchFlashcardSets();
  }, [documentId]);

  /* ================= GENERATE ================= */
  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcardSets();
    } catch (error) {
      toast.error(
        error.message || "Failed to generate flashcards."
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ================= NAVIGATION ================= */
  const handleNextCard = () => {
    if (!selectedSet) return;
    setCurrentCardIndex(
      (prev) => (prev + 1) % selectedSet.cards.length
    );
  };

  const handlePrevCard = () => {
    if (!selectedSet) return;
    setCurrentCardIndex(
      (prev) =>
        (prev - 1 + selectedSet.cards.length) %
        selectedSet.cards.length
    );
  };

  /* ================= STAR ================= */
  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);

      const updatedSets = flashcardSets.map((set) => {
        if (set._id === selectedSet._id) {
          return {
            ...set,
            cards: set.cards.map((card) =>
              card._id === cardId
                ? {
                    ...card,
                    isStarred: !card.isStarred,
                  }
                : card
            ),
          };
        }
        return set;
      });

      setFlashcardSets(updatedSets);
      setSelectedSet(
        updatedSets.find(
          (set) => set._id === selectedSet._id
        )
      );

      toast.success("Star updated!");
    } catch (error) {
      toast.error("Failed to update star.");
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(
        setToDelete._id
      );

      setFlashcardSets((prev) =>
        prev.filter(
          (set) => set._id !== setToDelete._id
        )
      );

      toast.success("Flashcard set deleted.");
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
    } catch (error) {
      toast.error("Failed to delete set.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  /* ================= VIEWER ================= */
  const renderFlashcardViewer = () => {
    const currentCard =
      selectedSet.cards[currentCardIndex];

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedSet(null)}
          className="flex items-center gap-2 text-indigo-600 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Sets
        </button>

        <Flashcard
          flashcard={currentCard}
          onToggleStar={handleToggleStar}
        />

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handlePrevCard}
            className="px-4 py-2 bg-slate-100 rounded-lg flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <span className="text-sm text-slate-600">
            {currentCardIndex + 1} /{" "}
            {selectedSet.cards.length}
          </span>

          <button
            onClick={handleNextCard}
            className="px-4 py-2 bg-slate-100 rounded-lg flex items-center gap-2"
          >
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  /* ================= SET LIST ================= */
  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="text-center py-12 space-y-4">
          <Brain
            size={50}
            className="mx-auto text-indigo-500"
          />
          <h3 className="text-xl font-semibold">
            No Flashcards Yet
          </h3>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            {generating
              ? "Generating..."
              : "Generate Flashcards"}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">
              Your Flashcard Sets
            </h3>
            <p className="text-sm text-slate-500">
              {flashcardSets.length}{" "}
              {flashcardSets.length === 1
                ? "set"
                : "sets"}{" "}
              available
            </p>
          </div>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow transition"
          >
            <Plus size={18} />
            {generating
              ? "Generating..."
              : "New Set"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() =>
                handleSelectSet(set)
              }
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer relative"
            >
              <button
                onClick={(e) =>
                  handleDeleteRequest(e, set)
                }
                className="absolute top-3 right-3 text-red-500"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center gap-3">
                <Brain className="text-indigo-500" />
                <div>
                  <h4 className="font-semibold">
                    Flashcard Set
                  </h4>
                  <p className="text-sm text-slate-500">
                    Created{" "}
                    {moment(
                      set.createdAt
                    ).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                {set.cards.length}{" "}
                {set.cards.length === 1
                  ? "card"
                  : "cards"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-6 relative">
        {selectedSet
          ? renderFlashcardViewer()
          : renderSetList()}

        {/* Floating Plus Button */}
        {!selectedSet &&
          flashcardSets.length > 0 && (
            <button
              onClick={handleGenerateFlashcards}
              disabled={generating}
              className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition"
            >
              <Plus size={24} />
            </button>
          )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() =>
          setIsDeleteModalOpen(false)
        }
        title="Delete Flashcard Set?"
      >
        <p className="mb-6 text-sm text-slate-600">
          Are you sure you want to delete
          this set? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={() =>
              setIsDeleteModalOpen(false)
            }
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardManager;


