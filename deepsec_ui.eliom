[%%shared
    open Eliom_lib
    open Eliom_content
    open Html.D
]

module Deepsec_ui_app =
  Eliom_registration.App (
    struct
      let application_name = "deepsec_ui"
      let global_data_path = None
    end)

let main_service =
  Eliom_service.create
    ~path:(Eliom_service.Path [])
    ~meth:(Eliom_service.Get Eliom_parameter.unit)
    ()

let () =
  Deepsec_ui_app.register
    ~service:main_service
    (fun () () ->
      Lwt.return
        (Eliom_tools.F.html
           ~title:"deepsec_ui"
           ~css:[["css";"deepsec_ui.css"]]
           Html.F.(body [
             h1 [pcdata "Welcome in DeepSec UI!"];
           ])))
