import { createAndAddElement } from "./createAndAddElement.js";

export const kanbanBoard = () => {
  const container = document.getElementById("kanban-app");

  // Ajout du tableau pour stocker nos donnees
  // ----------------------------------------------------
  let kanbanData = [];
  // ----------------------------------------------------

  // Permet de transformer les données en chaine de caracteres
  // ----------------------------------------------------
  const saveToLocalStorage = () => {
    localStorage.setItem("kanbanData", JSON.stringify(kanbanData));
  };
  // ----------------------------------------------------

  // Ajout de la fonction pour déplacer un élément sur son axe y et le container et
  // pouvoir le déplacer n´importe où
  // ----------------------------------------------------
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
  // ----------------------------------------------------

  // Création des tâches
  // ----------------------------------------------------
  const createTask = (
    taskName,
    parentList,
    taskId,
    inputKanban,
    divBottomList
  ) => {
    const taskElement = createAndAddElement(
      "span",
      parentList,
      taskName,
      {
        class: "span-task",
        draggable: "true",
        id: taskId,
      },
      divBottomList
    );

    // ----------------------------------------------------

    // Ajout du bouton pour supprimer les tâches
    // ----------------------------------------------------
    const buttonDeleteTask = createAndAddElement("button", taskElement, "x", {
      class: "button-delete-task",
    });
    // ----------------------------------------------------

    // Ajout de l´évémement pour supprimer les tâches
    // ----------------------------------------------------
    buttonDeleteTask.addEventListener("click", () => {
      taskElement.remove();
      const listIndex = kanbanData.findIndex(
        (list) => list.id === parentList.id
      );
      const taskIndex = kanbanData[listIndex].tasks.findIndex(
        (task) => task.id === taskId
      );
      kanbanData[listIndex].tasks.splice(taskIndex, 1);
      saveToLocalStorage();
    });

    taskElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", taskElement.id);
      taskElement.classList.add("dragging");
    });

    taskElement.addEventListener("dragend", () => {
      taskElement.classList.remove("dragging");
      saveToLocalStorage();
    });
  };
  // ----------------------------------------------------

  // Creation des éléments des listes
  // ----------------------------------------------------
  const createList = (listName, listData) => {
    const kanbanList = createAndAddElement("div", kanbanContent, "", {
      class: "list-kanban",
      id: listData.id,
    });

    const spanList = createAndAddElement("span", kanbanList, listName, {
      class: "span-kanban",
    });

    const buttonDeleteList = createAndAddElement("button", spanList, "x", {
      class: "button-delete-list",
    });

    const divBottomList = createAndAddElement("div", kanbanList, "", {
      class: "divBottomList",
    });

    const inputKanban = createAndAddElement("input", divBottomList, "", {
      class: "input-kanban",
    });
    // ----------------------------------------------------

    // Ajout des tâches
    // ----------------------------------------------------
    const buttonAddTask = createAndAddElement(
      "button",
      divBottomList,
      "Add Task",
      {
        class: "button-task",
      }
    );

    if (listData && listData.tasks) {
      listData.tasks.forEach((task) => {
        createTask(task.name, kanbanList, task.id, inputKanban, divBottomList);
      });
    }
    // ----------------------------------------------------

    // Ajoute de la liste comme la cible de dêpot valide
    // ----------------------------------------------------
    kanbanList.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    // ----------------------------------------------------

    // L´èlèment drop se déclenche dès que l´élément est relaché
    // On met à jour l´interface utilisateur et la base de données du tableau
    // ----------------------------------------------------
    kanbanList.addEventListener("drop", (e) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      const draggedElement = document.getElementById(taskId);
      const afterElement = getDragAfterElement(kanbanList, e.clientY);

      // On trouve l'objet de données de la tâche déplacée et on le retire de son ancienne liste
      let draggedTaskData;
      let listIndex = -1;
      kanbanData.forEach((list, index) => {
        const taskIndex = list.tasks.findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          draggedTaskData = kanbanData[index].tasks.splice(taskIndex, 1)[0];
          listIndex = index;
        }
      });

      if (draggedTaskData) {
        // Si draggedTaskedData est vrai on insère l'objet de la tâche dans sa nouvelle liste
        const destinationList = kanbanData.find(
          (list) => list.id === kanbanList.id
        );

        if (afterElement == null) {
          // Si afterElement est null on dépose à la fin de la liste
          destinationList.tasks.push(draggedTaskData);
          kanbanList.insertBefore(draggedElement, divBottomList);
        } else {
          // Sinon on dépose avant une autre tâche
          const afterTaskId = afterElement.id;
          const afterTaskIndex = destinationList.tasks.findIndex(
            (task) => task.id === afterTaskId
          );
          destinationList.tasks.splice(afterTaskIndex, 0, draggedTaskData);
          kanbanList.insertBefore(draggedElement, afterElement);
        }
        saveToLocalStorage();
      }
    });
    // ----------------------------------------------------

    // Bouton pour ajouter une tache
    // ----------------------------------------------------
    buttonAddTask.addEventListener("click", () => {
      const taskName = inputKanban.value;
      if (taskName) {
        const taskId = `task-${Date.now()}`;
        const newTask = { name: taskName, id: taskId };
        const listIndex = kanbanData.findIndex(
          (list) => list.id === kanbanList.id
        );
        kanbanData[listIndex].tasks.push(newTask);
        createTask(taskName, kanbanList, taskId, inputKanban, divBottomList);
        saveToLocalStorage();
        inputKanban.value = "";
      }
    });
    // ----------------------------------------------------

    // Ajout de l´événement pour supprimer les listes
    // ----------------------------------------------------
    buttonDeleteList.addEventListener("click", () => {
      kanbanList.remove();
      kanbanData = kanbanData.filter((list) => list.id !== kanbanList.id);
      saveToLocalStorage();
    });
  };
  // ----------------------------------------------------

  const divBoard = createAndAddElement("div", container, "", {
    class: "container-kanban",
  });

  const kanbanHeader = createAndAddElement("div", divBoard, "", {
    id: "header-kanban",
  });

  const kanbanTitle = createAndAddElement("h1", kanbanHeader, "Kanban Board");

  // Bouton pour ajouter les listes
  // ----------------------------------------------------
  const kanbanButtonList = createAndAddElement(
    "button",
    kanbanHeader,
    "Add List",
    {
      class: "button-kanban",
    }
  );
  // ----------------------------------------------------

  // Creation du conteneur principal
  // ----------------------------------------------------
  const kanbanContent = createAndAddElement("div", divBoard, "", {
    id: "content-kanban",
  });
  // ----------------------------------------------------

  // Sauvegarde dans le local storage
  // -------------------------------------------------
  const savedData = localStorage.getItem("kanbanData");
  if (savedData) {
    kanbanData = JSON.parse(savedData);
    kanbanData.forEach((list) => {
      createList(list.name, list);
    });
  }
  // ----------------------------------------------------

  // Ajout d'une liste
  // ----------------------------------------------------
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
// ----------------------------------------------------
