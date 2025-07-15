/// <reference types="vite/client" />

declare module 'vuetify/styles' {
  const content: any
  export default content
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
