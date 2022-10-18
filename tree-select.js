(function (window) {
  // adapted from https://stackoverflow.com/a/58205984/7613657

  const props = {
    fontFamily: "sans-serif",
    width: "30%",
    minWidth: "10em",
    background: "#333",
    color: "#fff",
    opacity: 0.85,
    basePadding: 0.25,
    borderThickness: 1,
    borderRadius: 0.4,
    headerHeight: 32,
    windowTitle: "",
  };

  let popupEl, popupHeader, popupBody, closeButton;
  let sel = window.getSelection();
  let currentNode;
  currentNode = sel.focusNode;
  if (!currentNode) {
    alert("Please select some text before running this bookmarklet");
    return;
  }

  function nodeSelectParent(thisNode) {
    let targetNode =
      thisNode.nodeName.toLowerCase() === "body"
        ? thisNode
        : thisNode.parentNode;
    targetNode.nodeName.toLowerCase() === "body"
      ? sel.setBaseAndExtent(targetNode.firstChild, 0, popupEl, 0)
      : sel.selectAllChildren(targetNode);
    return targetNode;
  }

  function nodeSelectFirstChild(thisNode) {
    let targetNode = thisNode.firstElementChild ?? thisNode;
    sel.setBaseAndExtent(
      targetNode,
      0,
      targetNode,
      targetNode.childNodes.length
    );
    return targetNode;
  }

  function nodeSelectNextSibling(thisNode) {
    let targetNode =
      thisNode.nextElementSibling &&
      thisNode.nextElementSibling.nodeName.toLowerCase() !==
        "node-selector-popup"
        ? thisNode.nextElementSibling
        : thisNode;
    sel.setBaseAndExtent(
      targetNode,
      0,
      targetNode,
      targetNode.childNodes.length
    );
    return targetNode;
  }

  const windowPosition = {
    left: ~~(document.documentElement.clientWidth / 2 - props.width / 2),
    top: ~~(document.documentElement.clientHeight / 2 - props.height / 2),
  };

  function buildPopup() {
    class NodeSelectorPopUp extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });

        popupEl = document.createElement("div");
        popupEl.setAttribute("id", "pop-up");

        popupHeader = document.createElement("div");
        popupHeader.setAttribute("class", "header");
        const popupHeaderTitle = document.createElement("span");

        popupHeaderTitle.setAttribute("class", "title");
        popupHeaderTitle.textContent = props.windowTitle;

        closeButton = document.createElement("button");
        closeButton.setAttribute("class", "close-button");
        closeButton.textContent = "×";
        closeButton.addEventListener("click", () => popupEl.remove(), false);

        popupBody = document.createElement("div");
        popupBody.setAttribute("class", "body");

        const p = document.createElement("p");
        p.textContent = "Choose node level for selection";

        const upButton = document.createElement("button");
        upButton.innerHTML = "Up";
        upButton.onclick = () => {
          currentNode = nodeSelectParent(currentNode) ?? currentNode;
        };

        const downButton = document.createElement("button");
        downButton.innerHTML = "Down";
        downButton.onclick = () => {
          currentNode = nodeSelectFirstChild(currentNode) ?? currentNode;
        };

        const nextButton = document.createElement("button");
        nextButton.innerHTML = "Next";
        nextButton.onclick = () => {
          currentNode = nodeSelectNextSibling(currentNode) ?? currentNode;
        };

        const style = document.createElement("style");
        style.textContent = `
          * {
            font-family: ${props.fontFamily};
          }

          #pop-up {
            position: fixed;
            left: ${windowPosition.left}px;
            top: ${windowPosition.top}px;
            z-index: ${Number.MAX_SAFE_INTEGER};
            width: ${props.width};
            min-width: ${props.minWidth};
            background: ${props.background};
            color: ${props.color};
            opacity: ${props.opacity};
            border-radius: ${props.borderRadius}em;
            border: ${props.borderThickness}px solid ${props.color};
          }

          #pop-up .header {
            padding: 0 ${props.basePadding}em ${props.basePadding}em 1em;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          #pop-up .header .title {

          }

          #pop-up .close-button {
            aspect-ratio: 1;
            color: ${props.color};
            text-align: center;
            padding: 0;
            border: none;
          }

          #pop-up .body {
            padding: ${props.basePadding}em 1em;
            display: grid;
            row-gap: ${props.basePadding}em;
          }

          button {
            cursor: pointer;
            background: none;
            padding: ${props.basePadding}em;
            border: ${props.borderThickness}px solid ${props.color};
            color: ${props.color};
            border-radius: ${props.borderRadius}em;
          }
        `;

        popupHeader.appendChild(popupHeaderTitle);
        popupHeader.appendChild(closeButton);

        popupBody.appendChild(p);
        popupBody.appendChild(upButton);
        popupBody.appendChild(downButton);
        popupBody.appendChild(nextButton);

        popupEl.appendChild(popupHeader);
        popupEl.appendChild(popupBody);

        shadow.appendChild(popupEl);
        shadow.appendChild(style);
      }
    }
    customElements.define("node-selector-popup", NodeSelectorPopUp);
  }
  buildPopup();

  let test = document.createElement("node-selector-popup");
  document.body.appendChild(test);

  draggable(popupHeader);

  /* Source: https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/ */
  function offset(el) {
    const rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  }
  /* Source: https://gist.github.com/remarkablemark/5002d27442600510d454a5aeba370579 */
  function draggable(el) {
    const initialOffset = offset(el.parentElement);
    let isMouseDown = false;
    const currPos = { x: 0, y: 0 };
    const elPos = { x: initialOffset.left, y: initialOffset.top };
    el.parentElement.addEventListener("mousedown", onMouseDown);
    function onMouseDown(event) {
      isMouseDown = true;
      currPos.x = event.clientX;
      currPos.y = event.clientY;
      el.parentElement.style.cursor = "move";
    }
    el.parentElement.addEventListener("mouseup", onMouseUp);
    function onMouseUp(event) {
      isMouseDown = false;
      elPos.x = parseInt(el.parentElement.style.left) || 0;
      elPos.y = parseInt(el.parentElement.style.top) || 0;
      el.parentElement.style.cursor = "auto";
    }
    document.addEventListener("mousemove", onMouseMove);
    function onMouseMove(event) {
      if (!isMouseDown) return;
      const delta = {
        x: event.clientX - currPos.x,
        y: event.clientY - currPos.y,
      };
      const pos = { x: elPos.x + delta.x, y: elPos.y + delta.y };
      if (pos.x < 0) {
        pos.x = 0;
      } else if (
        pos.x + el.parentElement.offsetWidth >
        document.documentElement.clientWidth
      ) {
        pos.x =
          document.documentElement.clientWidth - el.parentElement.offsetWidth;
      }
      if (pos.y < 0) {
        pos.y = 0;
      } else if (
        pos.y + el.parentElement.offsetHeight >
        document.documentElement.clientHeight
      ) {
        pos.y =
          document.documentElement.clientHeight - el.parentElement.offsetHeight;
      }
      el.parentElement.style.left = pos.x + "px";
      el.parentElement.style.top = pos.y + "px";
    }
  }
})(window);
