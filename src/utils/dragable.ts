import type { ObjectDirective, DirectiveBinding } from 'vue'

interface DraggableBinding {
  onDrag?: () => void;
}

interface DroppableBinding {
  accept: string;
  onDrop?: () => void;
}

export const vDraggable: ObjectDirective<HTMLElement, DraggableBinding> = {
  mounted: (el: HTMLElement, binding: DirectiveBinding<DraggableBinding>) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
    
    el.onmousedown = dragMouseDown
    
    function dragMouseDown(e: MouseEvent): void {
      e.preventDefault()
      pos3 = e.clientX
      pos4 = e.clientY
      document.onmouseup = closeDragElement
      document.onmousemove = elementDrag
      
      if (binding.value?.onDrag) {
        binding.value.onDrag()
      }
    }

    function elementDrag(e: MouseEvent): void {
      e.preventDefault()
      pos1 = pos3 - e.clientX
      pos2 = pos4 - e.clientY
      pos3 = e.clientX
      pos4 = e.clientY
      el.style.top = `${el.offsetTop - pos2}px`
      el.style.left = `${el.offsetLeft - pos1}px`
    }

    function closeDragElement(): void {
      document.onmouseup = null
      document.onmousemove = null
    }
  }
}

export const vDroppable: ObjectDirective<HTMLElement, DroppableBinding> = {
  mounted: (el: HTMLElement, binding: DirectiveBinding<DroppableBinding>) => {
    el.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault()
    })

    el.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault()
      const draggableEl = document.querySelector<HTMLElement>(binding.value.accept)
      if (draggableEl && binding.value.onDrop) {
        binding.value.onDrop()
      }
    })
  }
}
