javascript: (() => {
  /* adapted from https://stackoverflow.com/a/58205984/7613657 */

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
    let targetNode;
    if (
      thisNode.firstElementChild &&
      thisNode.firstElementChild.nodeName.toLowerCase() !==
        "node-selector-popup"
    ) {
      targetNode = thisNode.firstElementChild;
    } else {
      return thisNode;
    }
    sel.setBaseAndExtent(
      targetNode,
      0,
      targetNode,
      targetNode.childNodes.length
    );
    return targetNode;
  }

  function nodeSelectNextSibling(thisNode) {
    if (thisNode.nodeName.toLowerCase() === "body") {
      return thisNode;
    }
    let loopNode = thisNode.parentNode.firstElementChild;
    let targetNode =
      thisNode.nextElementSibling &&
      thisNode.nextElementSibling.nodeName.toLowerCase() !==
        "node-selector-popup"
        ? thisNode.nextElementSibling
        : loopNode;
    if (targetNode === null) {
      return thisNode;
    }
    sel.setBaseAndExtent(
      targetNode,
      0,
      targetNode,
      targetNode.childNodes.length
    );
    return targetNode;
  }

  function nodeSelectPrevSibling(thisNode) {
    if (
      thisNode.nodeName.toLowerCase() === "body" ||
      thisNode.parentNode.childElementCount === 0
    ) {
      return thisNode;
    }
    let loopNode =
      thisNode.parentNode.lastElementChild.nodeName.toLowerCase() ===
      "node-selector-popup"
        ? thisNode.parentNode.lastElementChild.previousElementSibling
        : thisNode.parentNode.lastElementChild;
    let targetNode = thisNode.previousElementSibling
      ? thisNode.previousElementSibling
      : loopNode;
    if (targetNode === null) {
      return thisNode;
    }
    sel.setBaseAndExtent(
      targetNode,
      0,
      targetNode,
      targetNode.childNodes.length
    );
    return targetNode;
  }
  function buildPopup() {
    class NodeSelectorPopUp extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });

        popupEl = document.createElement("div");
        popupEl.setAttribute("id", "pop-up");

        popupHeader = document.createElement("div");
        popupHeader.setAttribute("id", "header");
        const popupHeaderTitle = document.createElement("span");

        popupHeaderTitle.setAttribute("id", "title");
        popupHeaderTitle.textContent = "";

        closeButton = document.createElement("button");
        closeButton.setAttribute("id", "close-button");
        closeButton.textContent = "×";
        closeButton.addEventListener("click", () => popupEl.remove(), false);

        const popupMsg = document.createElement("div");
        popupMsg.textContent = "Choose node level for selection";

        popupButtons = document.createElement("div");
        popupButtons.setAttribute("id", "buttons");

        const docBodyButton = document.createElement("button");
        docBodyButton.setAttribute("id", "doc-body");
        docBodyButton.innerHTML = "<span>Document Body</span>";
        docBodyButton.onclick = () => {
          currentNode = document.body;
          currentNode = nodeSelectParent(currentNode) ?? currentNode;
        };

        const parentButton = document.createElement("button");
        parentButton.setAttribute("id", "parent");
        parentButton.innerHTML = "<span>Parent</span>";
        parentButton.onclick = () => {
          currentNode = nodeSelectParent(currentNode) ?? currentNode;
        };

        const childButton = document.createElement("button");
        childButton.setAttribute("id", "child");
        childButton.innerHTML = "<span>First<br/>Child</span>";
        childButton.onclick = () => {
          currentNode = nodeSelectFirstChild(currentNode) ?? currentNode;
        };

        const nextButton = document.createElement("button");
        nextButton.setAttribute("id", "next");
        nextButton.innerHTML = "<span>Next<br/>Sibling</span>";
        nextButton.onclick = () => {
          currentNode = nodeSelectNextSibling(currentNode) ?? currentNode;
        };

        const prevButton = document.createElement("button");
        prevButton.setAttribute("id", "prev");
        prevButton.innerHTML = "<span>Previous<br/>Sibling</span>";
        prevButton.onclick = () => {
          currentNode = nodeSelectPrevSibling(currentNode) ?? currentNode;
        };

        const style = document.createElement("style");
        style.textContent = `
          * {
            font-family: sans-serif;
          }

          #pop-up {
            position: fixed;
            left: 0;
            top: 0;
            z-index: ${Number.MAX_SAFE_INTEGER};
            background: #333;
            opacity: .85;
            border-radius: .4em;
            border: 1px solid #fff;
            padding-bottom: .75em;
            display: grid;
            gap: .25em;
            color: #fff;
          }

          #pop-up div:nth-child(n+2) {
            padding-left: .75em;
            padding-right: .75em;
          }

          #header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          #header #title {
          }

          #close-button {
            aspect-ratio: 1;
            border: none;
            padding: .25em .25em 0 0;
            line-height: .75em;
            text-align: center;
            color: #fff;
            font-size: 1.2em;
          }

          #buttons {
            display: grid;
            gap: .25em;
            grid-template-columns: 1fr 1.25fr 1fr;
            grid-template-areas:  "top top top"
                                  "left upper right"
                                  "left lower right";
          }

          button {
            background: none;
            border: 1px solid #fff;
            border-radius: .4em;
            padding: .25em;
            color: #fff;
            cursor: pointer;
          }

          button#doc-body {
            grid-area: top;
          }

          button#parent {
            grid-area: left;
          }

          button#parent span {
            /* writing-mode: vertical-rl; */
          }

          button#child {
            grid-area: right;
          }

          button#child span {
            /* writing-mode: vertical-rl; */
          }

          button#prev {
            grid-area: upper;
          }

          button#next {
            grid-area: lower;
          }
        `;

        popupHeader.appendChild(popupHeaderTitle);
        popupHeader.appendChild(closeButton);

        popupButtons.appendChild(docBodyButton);
        popupButtons.appendChild(parentButton);
        popupButtons.appendChild(childButton);
        popupButtons.appendChild(nextButton);
        popupButtons.appendChild(prevButton);

        popupEl.appendChild(popupHeader);
        popupEl.appendChild(popupMsg);
        popupEl.appendChild(popupButtons);

        shadow.appendChild(style);
        shadow.appendChild(popupEl);
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
})();
