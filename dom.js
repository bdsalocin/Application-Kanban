import { createAndAddElement } from "./createAndAddElement.js";

export const kanbanBoard = () => {
  const container = document.getElementById("kanban-app");
  let kanbanData = [];

  // Fonction pour sauvegarder dans localStorage
  let saveTimeout;
  const saveToLocalStorage = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const lightData = kanbanData.map((list) => ({
        id: list.id,
        name: list.name,
        tasks: list.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          color: task.color,
        })),
      }));
      localStorage.setItem("kanbanData", JSON.stringify(lightData));
    }, 500);
  };

  // Fonction pour gérer le glisser-déposer
  const getDragAfterElement = (container, y) => {
    const draggableElements = [
      ...container.querySelectorAll(".span-task:not(.dragging)"),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  };

  // Création des tâches
  const createTask = (taskData, parentList, divBottomList) => {
    const taskElement = createAndAddElement(
      "span",
      parentList,
      taskData.name,
      {
        class: "span-task",
        draggable: "true",
        id: taskData.id,
      },
      divBottomList
    );
    taskElement.style.backgroundColor = taskData.color;

    const list = kanbanData.find((l) => l.id === parentList.id);
    if (!list) {
      console.error("Liste non trouvée pour la tâche:", taskData);
      return;
    }

    const task = list.tasks.find((t) => t.id === taskData.id);
    if (!task && !taskData.id.startsWith("task-")) {
      console.warn(
        "Tâche non trouvée dans kanbanData, utilisation de taskData:",
        taskData
      );
    }

    // Bouton pour changer la couleur
    const colorButton = createAndAddElement("input", taskElement, "", {
      type: "color",
      value: taskData.color,
      class: "color-picker",
      "aria-label": "Choisissez une couleur pour cette tâche",
    });
    colorButton.addEventListener("input", (e) => {
      const newColor = e.target.value;
      taskElement.style.backgroundColor = newColor;
      if (list.tasks.some((t) => t.id === taskData.id)) {
        task.color = newColor;
      } else {
        taskData.color = newColor;
      }
      saveToLocalStorage();
    });

    // Double-clic pour renommer la tâche
    taskElement.addEventListener("dblclick", () => {
      const newNameTask = prompt(
        "Veuillez choisir un nouveau nom pour cette tâche"
      );
      if (
        newNameTask !== null &&
        newNameTask !== "" &&
        newNameTask !== taskData.name
      ) {
        if (list.tasks.some((t) => t.id === taskData.id)) {
          task.name = newNameTask;
        } else {
          taskData.name = newNameTask;
        }
        taskElement.textContent = newNameTask;
        saveToLocalStorage();
      }
    });

    // Bouton pour supprimer la tâche
    createAndAddElement("button", taskElement, "x", {
      class: "button-delete-task",
      "aria-label": "Supprimer une tâche",
    });

    // Écouteurs pour le glisser-déposer
    taskElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", taskElement.id);
      taskElement.classList.add("dragging");
    });

    taskElement.addEventListener("dragend", () => {
      taskElement.classList.remove("dragging");
    });
  };

  // Création du conteneur principal
  const divBoard = createAndAddElement("div", container, "", {
    class: "container-kanban",
  });

  const kanbanHeader = createAndAddElement("div", divBoard, "", {
    id: "header-kanban",
    role: "region",
    "aria-label": "En tête du tableau Kanban",
  });

  createAndAddElement("h1", kanbanHeader, "Kanban Board");

  // Bouton pour ajouter les listes
  const kanbanButtonList = createAndAddElement(
    "button",
    kanbanHeader,
    "Add List",
    {
      class: "button-kanban",
      "aria-label": "Ajouter une liste",
    }
  );

  // Création du conteneur principal pour les listes
  const kanbanContent = createAndAddElement("div", divBoard, "", {
    id: "content-kanban",
    role: "region",
    "aria-label": "Tableau Kanban",
  });

  // Délégation d'événements pour la suppression
  kanbanContent.addEventListener("click", (e) => {
    if (e.target.classList.contains("button-delete-task")) {
      const taskElement = e.target.parentElement;
      const taskId = taskElement.id;
      const listId = taskElement.parentElement.id;
      const listIndex = kanbanData.findIndex((list) => list.id === listId);
      if (listIndex !== -1) {
        kanbanData[listIndex].tasks = kanbanData[listIndex].tasks.filter(
          (task) => task.id !== taskId
        );
      }
      taskElement.remove();
      saveToLocalStorage();
    }

    if (e.target.classList.contains("button-delete-list")) {
      const listElement = e.target.closest(".list-kanban");
      const listId = listElement.id;
      listElement.remove();
      kanbanData = kanbanData.filter((list) => list.id !== listId);
      saveToLocalStorage();
    }
  });

  // Création des éléments des listes
  const createList = (listName, listData) => {
    const kanbanList = createAndAddElement("div", kanbanContent, "", {
      class: "list-kanban",
      id: listData.id,
      role: "region",
      "aria-labelledby": `title-${listData.id}`,
      tabindex: "0",
      "aria-live": "polite",
    });

    const spanList = createAndAddElement("span", kanbanList, listName, {
      id: `title-${listData.id}`,
      class: "span-kanban",
    });

    createAndAddElement("button", spanList, "x", {
      class: "button-delete-list",
      "aria-label": "Supprimer cette liste",
    });

    const divBottomList = createAndAddElement("div", kanbanList, "", {
      class: "divBottomList",
    });

    const inputKanban = createAndAddElement("input", divBottomList, "", {
      class: "input-kanban",
      placeholder: "Entrez une tâche",
      "aria-label": "Entrez le nom d'une tâche",
    });

    // Bouton pour ajouter une tâche
    const buttonAddTask = createAndAddElement(
      "button",
      divBottomList,
      "Add Task",
      {
        class: "button-task",
        "aria-label": "Ajouter une tâche",
      }
    );

    if (listData && listData.tasks) {
      listData.tasks.forEach((task) => {
        createTask(task, kanbanList, divBottomList);
      });
    }

    // Ajoute de la liste comme cible de dépôt valide
    kanbanList.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    // Gestion du drop
    kanbanList.addEventListener("drop", (e) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      const draggedElement = document.getElementById(taskId);
      const afterElement = getDragAfterElement(kanbanList, e.clientY);

      // Trouve la liste source et la tâche
      const sourceList = kanbanData.find((list) =>
        list.tasks.some((task) => task.id === taskId)
      );
      if (!sourceList) {
        console.error("Liste source non trouvée pour la tâche:", taskId);
        return;
      }

      const taskIndex = sourceList.tasks.findIndex(
        (task) => task.id === taskId
      );
      if (taskIndex === -1) {
        console.error("Tâche non trouvée dans la liste source:", taskId);
        return;
      }

      const draggedTaskData = sourceList.tasks.splice(taskIndex, 1)[0];
      const destinationList = kanbanData.find(
        (list) => list.id === kanbanList.id
      );
      if (!destinationList) {
        console.error("Liste de destination non trouvée:", kanbanList.id);
        return;
      }

      if (afterElement == null) {
        destinationList.tasks.push(draggedTaskData);
        kanbanList.insertBefore(draggedElement, divBottomList);
      } else {
        const afterTaskId = afterElement.id;
        const afterTaskIndex = destinationList.tasks.findIndex(
          (task) => task.id === afterTaskId
        );
        destinationList.tasks.splice(afterTaskIndex, 0, draggedTaskData);
        kanbanList.insertBefore(draggedElement, afterElement);
      }

      saveToLocalStorage();
    });

    // Bouton pour ajouter une tâche
    buttonAddTask.addEventListener("click", () => {
      const taskName = inputKanban.value;
      if (taskName) {
        const newTask = {
          id: `task-${Date.now()}`,
          name: taskName,
        };
        const listIndex = kanbanData.findIndex(
          (list) => list.id === kanbanList.id
        );
        if (listIndex !== -1) {
          kanbanData[listIndex].tasks.push(newTask);
          createTask(newTask, kanbanList, divBottomList);
          inputKanban.value = "";
          saveToLocalStorage();
        }
      }
    });
  };

  // Chargement des données sauvegardées
  const savedData = localStorage.getItem("kanbanData");
  if (savedData) {
    kanbanData = JSON.parse(savedData);
    kanbanData.forEach((list) => {
      createList(list.name, list);
    });
  }

  // Ajout d'une liste
  kanbanButtonList.addEventListener("click", () => {
    const listName = prompt("Ajouter un nom à votre liste");
    if (listName) {
      const listId = `list-${Date.now()}`;
      const newList = {
        id: listId,
        name: listName,
        tasks: [],
      };
      kanbanData.push(newList);
      createList(listName, newList);
      saveToLocalStorage();
    }
  });
};
