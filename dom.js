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
      ...container.querySelectorAll(".span-task:not(.dragging)"), // On décompose et on sélectionne tous les éléments HTML qui ont une classe span-task et qui n´ont pas la class dragging
    ];
    // on va comparer les éléments qui ne sont pas dans la liste et on va comparer leur position par rapport à la souris
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2; // permet de trouver la position d´un point par rapport où se trouve la souris pour trouver son centre
        // si offset positif souris en dessous, si negatif au dessus
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY } // = la plus petite valeur possible, permet au 1er élément de la liste
      // d´être considéré comme l´élément le plus proche lors de la 1ère comparaison car toute valeur sera supérieure à -Infinity.
    ).element;
  };
  // ----------------------------------------------------

  // Création des tâches
  // ----------------------------------------------------
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

    // Ajout de la couleur
    // ----------------------------------------------------

    taskElement.style.backgroundColor = taskData.color;

    // ----------------------------------------------------

    // Création d'un bouton pour changer la couleur
    const colorButton = createAndAddElement("input", taskElement, "", {
      type: "color",
      value: taskData.color,
      class: "color-picker",
    });

    // Événement pour changer la couleur
    colorButton.addEventListener("input", (e) => {
      const newColor = e.target.value;

      // On met à jour le DOM
      taskElement.style.backgroundColor = newColor;

      // On met à jour les données de kanbanData
      const list = kanbanData.find((l) => l.id === parentList.id); // représente chaque élément list du tableau pendant l´ítération
      const task = list.tasks.find((t) => t.id === taskData.id); // représente chaque élément task du tableau pendant l´ítération
      task.color = newColor;

      saveToLocalStorage();
    });
    // ----------------------------------------------------

    // Ajout de l´événement double click pour les taches
    // ----------------------------------------------------

    taskElement.addEventListener("dblclick", () => {
      const newNameTask = prompt(
        "Veuillez choisir un nouveau nom pour cette tâche"
      );
      if (
        newNameTask !== null &&
        newNameTask !== "" &&
        newNameTask !== taskData.name
      ) {
        taskElement.textContent = newNameTask;
        const list = kanbanData.find((l) => l.id === parentList.id);
        const task = list.tasks.find((t) => t.id === taskData.id);
        task.name = newNameTask;
        saveToLocalStorage();
      }
    });
    // ----------------------------------------------------

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
        (task) => task.id === taskData.id
      );
      kanbanData[listIndex].tasks.splice(taskIndex, 1);
      saveToLocalStorage();
    });

    taskElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", taskElement.id); // permet de représenter les données sans mise en forme
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
      placeholder: "Entrez une tâche",
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
        createTask(task, kanbanList, divBottomList);
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
        const newTask = {
          id: `task-${Date.now()}`,
          name: taskName,
          color: "rgba(178, 91, 244, 0.671)",
        };
        const listIndex = kanbanData.findIndex(
          (list) => list.id === kanbanList.id
        );
        kanbanData[listIndex].tasks.push(newTask);
        createTask(newTask, kanbanList, divBottomList);
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

  createAndAddElement("h1", kanbanHeader, "Kanban Board");

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
