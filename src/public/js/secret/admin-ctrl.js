let anchorID = null, anchorLength = null, anchorCollection = null,
	spin = false,
	areaData = {},
	positionData = {},
	directionData = {},
	categoryData = {}

/**
 * Find the description of the object inside of the
 * collections variables
 * @param {'area'|'position'|'directorate'|'category'} collection Collection to be searched
 * @param {Number} id ID of the element
 */
const findFrom = (collection, id) => {
	if(id <= 0 || !id) return id

	let elem
	switch (collection) {
		case 'area':
			elem = areaData.find(x => x._id == id)
			return elem.description[lang]
		case 'position':
			elem = positionData.find(x => x._id == id)
			return elem.description[lang]
		case 'directorate':
			elem = directionData.find(x => x._id == id)
			return elem.description[lang]
		case 'category':
			elem = categoryData.find(x => x._id == id)
			return elem.description[lang]
		default:
			return id
	}
}

window.addEventListener('load', async() => {
	eventAssigner('#tables-opts .dropdown-item', 'click', findCollections)

	try {
		areaData = JSON.parse($e('#areaData').value)
		directionData = JSON.parse($e('#directionData').value)
		positionData = JSON.parse($e('#positionData').value)
		categoryData = JSON.parse($e('#categoryData').value)

		if(areaData == false || areaData.length == 0)
			throw Array(
				'No se obtuvieron datos de la colección: Área. Por favor, contacte con soporte.',
				'No data were obtained from the collection: Area. Please, contact support'
			)[lang]
		if(directionData == false || directionData.length == 0)
			throw Array(
				'No se obtuvieron datos de la colección: Dirección. Por favor, contacte con soporte.',
				'No data were obtained from the collection: Directorate. Please, contact support'
			)[lang]
		if(positionData == false || positionData.length == 0)
			throw Array(
				'No se obtuvieron datos de la colección: Puesto. Por favor, contacte con soporte.',
				'No data were obtained from the collection: Position. Please, contact support'
			)[lang]
		if(categoryData == false || categoryData.length == 0)
			throw Array(
				'No se obtuvieron datos de la colección: Categoría. Por favor, contacte con soporte.',
				'No data were obtained from the collection: Category. Please, contact support'
			)[lang]

		$e('#tables-opts .dropdown-item[data-table="1"]').click()
		eventAssigner('#reload-list', 'click', () => {
			anchorID = null
			anchorLength = null
			anchorCollection = null

			findCollections()
		})
	} catch (error) {
		console.error(error)
		showSnack(error, null, 'error')

		$e('#collector-accordion').insertAdjacentHTML(
			'afterbegin',
			`<td id="empty" colspan="5" class="border-0 text-center">
				<div class="text-center">
					<i class="fa-solid fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
					<p class="my-2 text-ghost fs-4">${
						Array('No hay datos para mostrar', 'No records to show')[lang]
					}</p>
			</div></td>`
		)
	} finally {
		$a('.rm').forEach(node => node.remove())

		areaData.forEach(obj => {
			$e('#manual-reg #area').insertAdjacentHTML(
				'beforeend',
				`<option class="area-opt" value="${ obj._id }">${
					obj.description[lang]
				}</option>`
			)
		})
		directionData.forEach(obj => {
			$e('#manual-reg #directorate').insertAdjacentHTML(
				'beforeend',
				`<option class="directorate-opt" value="${ obj._id }">${
					obj.description[lang]
				}</option>`
			)
		})
		positionData.forEach(obj => {
			$e('#manual-reg #position').insertAdjacentHTML(
				'beforeend',
				`<option class="position-opt" value="${ obj._id }">${
					obj.description[lang]
				}</option>`
			)
		})
		categoryData.forEach(obj => {
			$e('#manual-reg #category').insertAdjacentHTML(
				'beforeend',
				`<option class="category-opt" value="${ obj._id }">${
					obj.description[lang]
				}</option>`
			)
		})
	}

	let newSuper = '',
		confirmPass = ''
	eventAssigner('.cancel-super', 'click', () => {
		$e('#new-super').value = ''
		$e('#new-super').dataset.id = ''
	})

	eventAssigner('#check-super', 'click', () => {
		let temp = $e('#new-super').dataset.id
		if(temp.length < 4) {
			return showSnack(
				[`El ID del usuario tiene un formato erróneo. Se obtuvo "${temp.length}".`,
				`User ID is in the wrong format. "${temp.length}" was obtained.`],
				null, 'warning'
			)
		} 
		else {
			newSuper = temp
			$e('#close-modal-super').click()
			$e('#modal-super-confirm').click()
		}
	})

	eventAssigner('#add-super-user', 'click', ()=> {
		confirmPass = $e('#confirm-pass-super').value
		fetchTo(
			window.location.origin+'/admin-control/super-user',
			'POST',
			{ _id: newSuper, pass: confirmPass },
			(result) => {
				let SNK_Type
				if(result.status === 200)  {
					SNK_Type = 'success'
					newSuper = '',
					$e('#new-super').value = ''
					$e('#new-super').dataset.id = ''
				}
				else SNK_Type = 'warning'

				if(Boolean(result.snack) == true) {
					showSnack(result.msg, null, SNK_Type)
				}
			},
			(error) => {
				console.error(error)
				showSnack(error, null, 'error')
			}
		).finally(() => {
			$e('#confirm-pass-super').value = ''
			confirmPass = ''
		})
	})
})

/**
 * Edit a user info, show buttons and set a restore
 * point for all inputs in case of cancel
 * @param {*} e Event
 */
const editInfo = (e) => {
	let tgt = e.target.getAttribute('data-id')

	if((tgt).length) {
		$a(`.${tgt}:not(.read-only)`).forEach(node => {
			node.disabled = false

			if(node.type === 'checkbox')
				node.setAttribute('data-restore', node.checked)
			else
				node.setAttribute('data-restore', node.value)
		})
		$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
			node.classList.remove('d-none')
			node.disabled = false
		})
		$e(`#edit-${tgt}`).classList.add('d-none')
		$e(`#edit-${tgt}`).disabled = true
	} else
		log(`[AD-CTRL] Not found ID target in button event (target = ${tgt})`, 'error')
}

/**
 * Cancel the current operation (lock inputs) and
 * restore the original values
 * @param {*} e Event
 */
const cancelInfo = (e) => {
	let tgt = e.target.getAttribute('data-id')

	$a(`.${tgt}.edited`).forEach(node => {
		if(node.type === 'checkbox')
			node.checked = node.dataset.restore
		else
			node.value = node.dataset.restore
		node.removeAttribute('data-restore')
		node.classList.remove('edited')
	})

	$a(`.${tgt}:not(.read-only)`).forEach(node => {
		node.disabled = true
	})
	$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
		node.classList.add('d-none')
		node.disabled = true
	})
	$e(`#edit-${tgt}`).classList.remove('d-none')
	$e(`#edit-${tgt}`).disabled = false
}

/**
 * Save the information edited 🤠
 * @param {*} e Event
 */
const updateInfo = (e) => {
	let tgt = e.target.getAttribute('data-id'),
		pkg = {
			_id: e.target.getAttribute('data-id').split('_')[1],
			collection: parseInt(e.target.getAttribute('data-table'))
		}

	if(String(tgt).length) {
		let passInfo = true

		switch(pkg.collection) {
			case 1:
				$a(`.${tgt}.edited`).forEach(node => {
					if(passInfo) {
						if(node.dataset.class == 'user_all' || node.dataset.class == 'user') {
							if(!('user' in pkg)) pkg['user'] = {} // if not exists user
							if(node.type == "checkbox")
								pkg.user[node.name] = !node.checked
							else {
								if(node.type == "password")
									if(node.value.length < 8) {
										passInfo = false
										return showSnack(
											['La nueva contraseña debe contener al menos 8 caracteres.',
											'The new password must contain at least 8 characters.'],
											null, 'warning'
										)
									}
								pkg.user[node.name] = node.value
							}
						}
						if(node.dataset.class == 'user_all' || node.dataset.class == 'user_info') {
							if(!('user_info' in pkg)) pkg['user_info'] = {} // if not exists user_info
							if(node.type == "checkbox")
								pkg.user_info[node.name] = !node.checked
							else
								pkg.user_info[node.name] = node.value
						}
						if(node.dataset.class == 'evaluation') {
							if(node.checked == true) {
								if(!('evaluation' in pkg))
									pkg['evaluation'] = { records: {} } // if not exists evaluation.records
								if(!(node.dataset.year in pkg.evaluation.records))
									pkg.evaluation.records[node.dataset.year] = { disabled: true } // and the years
							} else {
								if(!('rm_evaluation' in pkg)) pkg['rm_evaluation'] = {} // if not exists rm_evaluation
								pkg.rm_evaluation[`records.${node.dataset.year}`] = ''
							}
						}
					}
				})
				break

			case 2:
				pkg['area'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.area.description[parseInt(node.name)] = node.value
				})
				break

			case 3:
				pkg['directorate'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.directorate.description[parseInt(node.name)] = node.value
				})
				break

			case 4:
				pkg['position'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.position.description[parseInt(node.name)] = node.value
				})
				break

			case 5:
				pkg['category'] = { description : [] }
				$a(`input.${tgt}`).forEach(node => {
					pkg.category.description[parseInt(node.name)] = node.value
				})
				break
		}
		delete pkg['collection']

		if(passInfo) {
			fetchTo(
				window.location.origin+'/admin-control/update',
				'POST',
				pkg,
				(result) => {
					if(result.snack)
						showSnack(result.msg, null, (result.status === 200)?'success':'warning')
	
					if(result.status === 200) {
						showSnack(Array('Cambios guardados', 'Changes saved')[lang], null, 'success')
						$a(`.${tgt}:not(.read-only)`).forEach(node => {
							node.disabled = true
						})
						$a(`#save-${tgt}, #cancel-${tgt}`).forEach(node => {
							node.classList.add('d-none')
							node.disabled = true
						})
						$e(`#edit-${tgt}`).classList.remove('d-none')
						$e(`#edit-${tgt}`).disabled = false
					}
				},
				(error) => {
					console.error(error)
				}
			)
		}
	} else return showSnack(
		[`[AD-CTRL] No se encontró el ID del objetivo en el evento del botón (objetivo= ${tgt})`,
		`[AD-CTRL] Not found ID target in button event (target= ${tgt})`],
		null, 'warning'
	)
}

/**
 * "Highlights" the inputs that had been modified
 * @param {*} e Event
 */
const highlighter = (e) => {
	let tgt = e.target

	if('restore' in tgt.dataset) {
		if(tgt.value == tgt.getAttribute('data-restore'))
			tgt.classList.remove('edited')
		else
			tgt.classList.add('edited')
	}
}

const findCollections = (e) => {
	let title = (e != undefined) ? e.target.innerHTML
		: ($e('#tables-opts .dropdown-item:disabled'))
			? $e('#tables-opts .dropdown-item:disabled').innerHTML
			: null,
		pkg = {
			search: (e != undefined) ? e.target.dataset.table // Collection
				: ($e('#tables-opts .dropdown-item:disabled'))
					? $e('#tables-opts .dropdown-item:disabled').dataset.table
					: null,
			limit: $e('#rows') ? parseInt($e('#rows').value) : 10 // Limit of rows
		}
	// Documents to skip (this is the operation in server: limit * skip = first document of the page)
	pkg['skip'] = ($e('.num-page.active') && anchorCollection == pkg.search) ? parseInt($e('.num-page.active').rel) : 0

	$e('#reload-list').classList.add('rotate') // Reload button animation start

	if(pkg.search) {
		fetchTo(
			window.location.origin+'/admin-control/search',
			'POST',
			pkg,
			(result) => {
				if(result.status === 200) {
					if(e != undefined) {
						if($e('#tables-opts .dropdown-item:disabled'))
							$e('#tables-opts .dropdown-item:disabled').disabled = false
							e.target.disabled = true
						}

					if(result.data.length) {
						if(result.data.length != anchorLength || result.data[0]._id != anchorID || pkg.search != anchorCollection) {
							try {
								// This if works to stop a duplicate search
								$e('#collector-accordion').innerHTML = '' // Clear the list
								$e('#collector .lang').innerHTML = title // Set the title

								if(pkg.search == 1) {
									anchorID = result.data[0]._id

									for(let i in result.data) {
										let evalRecords = ''

										if('eval_' in result.data[i]) {
											if(Object.keys(result.data[i].eval_.records).length != 0) {
												console.log()
												for(let r in result.data[i].eval_.records) {
													evalRecords += `<div class="my-1 col-md-6 col-12 accordion accordion-flush" id="user-eval-${ result.data[i].eval_.records[r].year }-${ result.data[i]._id }">
														<div class="accordion-item">
															<h2 class="accordion-header" id="user-flush-eval-${ result.data[i].eval_.records[r].year }-${ result.data[i]._id }">
																<button class="btn-outline-success accordion-button collapsed" type="button" data-bs-toggle="collapse"
																data-bs-target="#user-flush-eval-${ result.data[i].eval_.records[r].year }-collapse-${ result.data[i]._id }" aria-expanded="false"
																aria-controls="user-flush-eval-${ result.data[i].eval_.records[r].year }-collapse-${ result.data[i]._id }">
																	${ Array('Año: '+result.data[i].eval_.records[r].year, 'Year: '+result.data[i].eval_.records[r].year)[lang] }
																</button>
															</h2>
															<div id="user-flush-eval-${ result.data[i].eval_.records[r].year }-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
																aria-labelledby="user-flush-eval-${ result.data[i].eval_.records[r].year }-${ result.data[i]._id }"
																data-bs-parent="#flush-eval-collapse-${ result.data[i]._id }">
																<div class="accordion-body px-0">
																	<div class="row">
																		<div class="my-1 col-12">
																			<p class="text-mini-label text-center m-0">
																				${ Array('Habilitado', 'Enabled')[lang] }
																			</p>
																			<div class="container ps-3">
																				<div class="button b2 mt-2 mb-2" id="button-17">
																					<input name="disabled" type="checkbox"
																						class="checkbox _${ result.data[i]._id } ${
																							( /* If the year is not equal to the current year or exists "score" in the record */
																								result.data[i].eval_.records[r].year != CURRENT_YEAR
																								|| 'score' in result.data[i].eval_.records[r]
																							) ? 'read-only' : '' /* then the input will be read-only, else can be modified */
																						}"
																						data-class="evaluation" data-year="${ result.data[i].eval_.records[r].year }"
																						${ ('disabled' in result.data[i].eval_.records[r]) ? 'checked' : '' /* Unchecked = Yes, Checked= No */ } }
																						disabled>
																						<div class="knobs" data-unchecked="${ Array('Sí', 'Yes')[lang] }"
																							data-checked="${ Array('No', 'No')[lang] }"><span></span></div>
																					<div class="layer"></div>
																		</div></div></div>
																		${ (!('disabled' in result.data[i].eval_.records[r])) // If not disabled
																		? `<div class="my-1 col-12 col-md-6">
																				<p class="text-mini-label text-center m-0">
																					${ Array('Puntuación', 'Score')[lang] }
																				</p>
																				<input value="${ result.data[i].eval_.records[r].score }"
																					class="form-control _${ result.data[i]._id } read-only"
																					name="score"
																					data-class="evaluation" data-year="${ result.data[i].eval_.records[r].year }" type="text" disabled>
																			</div><div class="my-1 col-12 col-md-6">
																				<p class="text-mini-label text-center m-0">
																					${ Array('Respuestas', 'Answers')[lang] }
																				</p>
																				<input value="${ result.data[i].eval_.records[r].answers }"
																					class="form-control _${ result.data[i]._id } read-only"
																					name="answers"
																					data-class="evaluation" data-year="${ result.data[i].eval_.records[r].year }" type="text" disabled>
																			</div><div class="my-1 col-12 col-xxl-6 mx-auto">
																				<p class="text-mini-label text-center m-0">
																					${ Array('Área', 'Area')[lang] }
																				</p>
																				<input value="${ findFrom('area',
																						(result.data[i].eval_.records[r].area)
																						? result.data[i].eval_.records[r].area : 0
																					) }"
																					class="form-control _${ result.data[i]._id } read-only"
																					name="area"
																					data-class="evaluation" data-year="${ result.data[i].eval_.records[r].year }" type="text" disabled/>
																			</div>
																			${ ('directorate' in result.data[i].eval_.records[r])
																				?`<div class="my-1 col-12 col-xxl-6 mx-auto">
																					<p class="text-mini-label text-center m-0">
																						${ Array('Dirección / Subdirección', 'Directorate / Sub-directorate')[lang] }
																					</p>
																					<input value="${ findFrom('directorate',
																							(result.data[i].eval_.records[r].directorate)
																							? (result.data[i].eval_.records[r].directorate) : 0
																						) }"
																						class="form-control _${ result.data[i]._id } read-only"
																						name="directorate"  data-class="evaluation"
																						data-year="${ result.data[i].eval_.records[r].year }" type="text" disabled/>
																				</div>` : ''
																			}` : '' }
													</div></div></div></div></div>`
												}
											} else {
												evalRecords = `<div class="col-12 text-center text-black-50"><p class="fs-4">${
													Array('No hay registros', 'No records')[lang]
												}</p></div>`
											}
										}

										$e('#collector-accordion').insertAdjacentHTML(
											'beforeend',
											`<div class="accordion-item">
												<h2 class="accordion-header" id="flush-collector-${ result.data[i]._id }">
													<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
													data-bs-target="#flush-collector-collapse-${ result.data[i]._id }" aria-expanded="false"
													aria-controls="flush-collector-collapse-${ result.data[i]._id }">
														<div class="item-header d-flex w-100">
															<div class="text-center p-0 col-3 d-flex"> <p class="m-0 id-text">ID: ${ result.data[i]._id }</p> </div>
															<div class="text-center p-0 mx-2"> <p class="m-0 name-text">${ result.data[i].name }</p> </div>
															<div class="text-right p-0 ms-auto me-2">
																<p class="m-0">${ (result.data[i].category == -1) ? 'AD'
																	: ( (result.data[i].enabled)
																	? Array('Habilitado', 'Enabled')[lang]
																	: Array('Deshabilitado', 'Disabled')[lang] )
																}</p>
												</div></div></button></h2>
												<div id="flush-collector-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
													aria-labelledby="flush-collector-${ result.data[i]._id }" data-bs-parent="#collector-accordion">
													<div class="accordion-body px-3">
														<div class="my-md-2 my-1 px-md-3 py-md-2 p-2 rounded-3">
															<div class="row">
																<h6 class="col-12 p-0 text-black-50 fs-5">${
																	Array('Información de puesto', 'Position information')[lang]
																}</span>
																</h6>
																${ (false) ? `<div class="col-12"><h6 class="p-0 text-black-50 fs-5">${
																	Array('Información de puesto', 'Position information')[lang]
																	}</h6></div>` : ''
																}
																${ ('area' in result.data[i])
																	? `<div class="my-1 col-md-6 col-12">
																		<p class="text-mini-label text-center m-0">${
																			Array('Área de adscripción', 'Adscription area')[lang]
																		}</p>
																		<input value="${ findFrom('area', result.data[i].area) }"
																			class="form-control _${ result.data[i]._id }" name="area"
																			data-class="user_info" type="text" disabled/>
																	</div>`
																	: '' }
																${ ('directorate' in result.data[i])
																	? `<div class="my-1 col-md-6 col-12">
																		<p class="text-mini-label text-center m-0">${
																			Array('Dirección / Subdirección', 'Directorate / Sub-directorate')[lang]
																		}</p>
																		<input value="${ findFrom('directorate', result.data[i].directorate) }"
																		class="form-control _${ result.data[i]._id }" name="directorate"
																		data-class="user_info" type="text" disabled/>
																	</div>`
																	: '' }
																${ ('category' in result.data[i])
																	? `<div class="my-1 col-md-6 col-12">
																		<p class="text-mini-label text-center m-0">${
																			Array('Categoría', 'Category')[lang]
																		}</p>
																		<input value="${ findFrom('category', result.data[i].category) }"
																		class="form-control _${ result.data[i]._id }" name="category"
																		data-class="user_info" type="text" disabled/>
																	</div>`
																	: '' }
																${ ('position' in result.data[i])
																	? `<div class="my-1 col-md-6 col-12">
																		<p class="text-mini-label text-center m-0">${
																			Array('Puesto', 'Position')[lang]
																		}</p>
																		<input value="${ findFrom('position', result.data[i].position) }"
																		class="form-control _${ result.data[i]._id }" name="position"
																		data-class="user_info" type="text" disabled/>
																	</div>`
																	: '' }
															</div>
															${ ('manager' in result.data[i])
																? `<div class="row">
																	<div class="my-1 col-md-5 col-6 mx-auto">
																	<p class="text-mini-label text-center m-0">${
																		Array('ID Jefe directo', 'ID manager')[lang]
																	}</p>
																	<input value="${ result.data[i].manager }" class="form-control dynamic-hint _${ result.data[i]._id }"
																	name="manager" data-hint-display="all" data-hint-collection="user_info" data-hint-target="id"
																	type="text" disabled/>
																</div></div>`
																: '' }
														</div>
														${ ('user_' in result.data[i])
															? `<div class="my-md-2 my-1 px-md-3 py-md-2 p-2 rounded-3">
																<div class="row">
																<div class="col-12">
																<h6 class="p-0 text-black-50 fs-5">${
																	Array('Información de solo lectura', 'Read-Only information')[lang]
																}</h6></div>

																<div class="my-1 col-md-6 col-12 mx-auto">
																<p class="text-mini-label text-center m-0">${
																	Array('Creado', 'Created')[lang]
																}</p>
																<input value="${ result.data[i].user_.created.date } @ ${ result.data[i].user_.created.time }"
																class="form-control _${ result.data[i]._id } date read-only text-center"
																name="created" type="text" disabled/>
																</div>
																<div class="my-1 col-md-6 col-12 mx-auto">
																<p class="text-mini-label text-center m-0">${
																	Array('Ultimo inicio de sesión', 'Last login')[lang]
																}</p>
																<input value="${ result.data[i].user_.last_conn.date } @ ${ result.data[i].user_.last_conn.time }"
																class="form-control _${ result.data[i]._id } date read-only text-center"
																name="lastConn" type="text" disabled/>
															</div></div></div>` : ''
														}
														<div class="accordion accordion-flush mt-2" id="inner-accordions-${ result.data[i]._id }">
															${ ('eval_' in result.data[i])
																? `<!-- Evaluation information -->
																<div class="accordion-item">
																<h2 class="accordion-header" id="flush-eval-${ result.data[i]._id }">
																<button class="btn-outline-success accordion-button collapsed"
																type="button" data-bs-toggle="collapse" data-bs-target="#flush-eval-collapse-${ result.data[i]._id }"
																aria-expanded="false" aria-controls="flush-eval-collapse-${ result.data[i]._id }">${
																	Array('Evaluaciones', 'Evaluations')[lang]
																}</button></h2>
																<div id="flush-eval-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
																aria-labelledby="flush-eval-${ result.data[i]._id }" data-bs-parent="#inner-accordions-${ result.data[i]._id }">
																<div class="accordion-body px-0">
																<div class="row">${
																	evalRecords
																}</div></div></div></div>` : ''
															}
															<!-- Sensitive information -->
															<div class="accordion-item">
																<h2 class="accordion-header" id="flush-sensitive-${ result.data[i]._id }">
																	<button class="btn-outline-warning accordion-button collapsed" type="button" data-bs-toggle="collapse"
																		data-bs-target="#flush-sensitive-collapse-${ result.data[i]._id }" aria-expanded="false"
																		aria-controls="flush-sensitive-collapse-${ result.data[i]._id }">
																		${ Array('Información sensible', 'Sensitive information')[lang] }
																	</button>
																</h2>
																<div id="flush-sensitive-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
																	aria-labelledby="flush-sensitive-${ result.data[i]._id }" data-bs-parent="#inner-accordions-${ result.data[i]._id }">
																	<div class="accordion-body px-0">
																		<div class="row">
																			<div class="my-1 col-md-9 col-12 mx-auto">
																				<p class="text-mini-label text-center m-0">
																					${ Array('Nombre', 'Name')[lang] }
																				</p>
																				<input value="${ result.data[i].name }" class="form-control _${ result.data[i]._id }"
																					name="name" data-class="user_info" type="text" disabled>
															</div></div></div></div></div>
															<!-- Danger Zone -->
															<div class="accordion accordion-flush mt-2" id="user-accordion-inner-${ result.data[i]._id }">
																<div class="accordion-item">
																	<h2 class="accordion-header" id="danger-flush-${ result.data[i]._id }">
																		<button class="btn-outline-danger accordion-button collapsed" type="button" data-bs-toggle="collapse"
																			data-bs-target="#danger-flush-collapse-${ result.data[i]._id }" aria-expanded="false"
																			aria-controls="danger-flush-collapse-${ result.data[i]._id }">
																			${ Array('Zona de peligro', 'Danger zone')[lang] }
																		</button>
																	</h2>
																	<div id="danger-flush-collapse-${ result.data[i]._id }" class="accordion-collapse collapse"
																		aria-labelledby="danger-flush-${ result.data[i]._id }" data-bs-parent="#inner-accordions-${ result.data[i]._id }">
																		<div class="accordion-body px-0">
																			<div class="row">
																				${ (result.data[i].category != -1)
																					? `<div class="my-1 col-md-4 col-12 mx-auto">
																						<p class="text-mini-label text-center m-0">
																							${ Array('Usuario habilitado', 'User enabled')[lang] }
																						</p>
																						<div class="container ps-3">
																							<div class="button b2 mt-2 mb-2" id="button-17">
																								<input name="enabled" type="checkbox"
																									data-class="${
																										('user_' in result.data[i]) ? 'user_all' : 'user_info'
																									}" class="checkbox _${ result.data[i]._id }"
																										${(result.data[i].enabled) ? '' : 'checked' /*checked = No*/} disabled>
																									<div class="knobs" data-unchecked="${ Array('Sí', 'Yes')[lang] }"
																										data-checked="${ Array('No', 'No')[lang] }"><span></span></div>
																								<div class="layer"></div>
																							</div>
																						</div>
																					</div>`
																					: ''
																				}
																				${ ('user_' in result.data[i])
																					? `<div class="my-1 col-md-5 col-12 mx-auto">
																						<p class="text-mini-label text-center m-0">
																							${ Array('Contraseña', 'Password')[lang] }
																						</p>
																						<input value="amogus_sussy_bak😈📸" class="form-control _${ result.data[i]._id } mt-2"
																							name="pass" data-class="user" type="password" minlength="8"
																							autocomplete="new-password" disabled>
																					</div>` : ''
																				}
														</div></div></div></div></div></div>
														<div class="w-100 text-right d-flex justify-content-end mt-2 pe-3">
															<button id="edit-_${ result.data[i]._id }" data-id="_${ result.data[i]._id }"
																data-table="1" class="btn-edit btn btn-secondary px-3 py-2">
																<i class="pe-none pe-1 fa-solid fa-pen-to-square"></i>
																<span class="pe-none">${ Array('Editar', 'Edit')[lang] }</span>
															</button>
															<button id="cancel-_${ result.data[i]._id }" data-id="_${ result.data[i]._id }"
																data-table="1" class="btn-cancel btn btn-outline-danger px-3 py-2 me-2 d-none" disabled>
																<i class="pe-none pe-1 fa-solid fa-ban"></i>
																<span class="pe-none">${ Array('Cancelar', 'Cancel')[lang] }</span>
															</button>
															<button id="save-_${ result.data[i]._id }" data-id="_${ result.data[i]._id }"
																data-table="1" class="btn-save btn btn-outline-dark px-3 py-2 d-none" disabled>
																<i class="pe-none pe-1 fa-solid fa-floppy-disk"></i>
																<span class="pe-none">${ Array('Guardar', 'Save')[lang] }</span>
											</button></div></div></div></div>`
										)
									}
								} else {
									for(let i in result.data) {
										$e('#collector-accordion').insertAdjacentHTML(
											'afterbegin',
											`<div class="accordion-item">
												<h2 class="accordion-header" id="flush-head-collector-${ result.data[i]['_id'] }">
													<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
														data-bs-target="#flush-collector-${ result.data[i]['_id'] }" aria-expanded="false"
														aria-controls="flush-collector-${ result.data[i]['_id'] }">
														<div class="item-header d-flex w-100">
															<div class="text-center p-0 col-2 d-flex">
																<p class="m-0">ID: ${ result.data[i]['_id'] }</p>
															</div>
															<div class="text-right p-0 ms-auto me-2">
																<p class="m-0 lang" data-lang="es">${
																	(result.data[i]['description'][lang])
																	? result.data[i]['description'][lang]
																	: result.data[i]['description'][0]
																}</p>
												</div></div></button></h2>

												<div id="flush-collector-${ result.data[i]['_id'] }" class="accordion-collapse collapse"
													aria-labelledby="flush-head-collector-${ result.data[i]['_id'] }" data-bs-parent="#collector-accordion">
													<div class="accordion-body px-3">
														<div class="row">
															<div class="my-1 col-md-6 col-12 mx-auto">
																<p class="text-mini-label text-center m-0">${
																	Array('Idioma (es)', 'Language (es)')[lang]
																}</p>
																<input value="${ result.data[i]['description'][0] }" class="form-control _${ result.data[i]['_id'] }"
																	name="0" type="text" disabled>
															</div><div class="my-1 col-md-6 col-12 mx-auto">
																<p class="text-mini-label text-center m-0">${
																	Array('Idioma (en)', 'Language (en)')[lang]
																}</p>
																<input value="${ (result.data[i]['description'][1]) ? result.data[i]['description'][1] : '' }"
																	name="1" class="form-control _${ result.data[i]['_id'] }"
																	type="text" disabled>
														</div></div>
														<div class="w-100 text-right d-flex justify-content-end mt-2 pe-3">
															<button id="edit-_${ result.data[i]._id }" data-id="_${ result.data[i]['_id'] }" data-table="${pkg.search}"
																class="btn-edit btn btn-secondary px-3 py-2">
																<i class="pe-none pe-1 fa-solid fa-pen-to-square"></i>
																<span class="pe-none lang">${
																	Array('Editar', 'Edit')[lang]
																}</span>
															</button>
															<button id="cancel-_${ result.data[i]._id }" data-id="_${ result.data[i]['_id'] }" data-table="${pkg.search}"
																class="btn-cancel btn btn-outline-danger px-3 py-2 me-2 d-none" disabled>
																<i class="pe-none pe-1 fa-solid fa-ban"></i>
																<span class="pe-none lang">${
																	Array('Cancelar', 'Cancel')[lang]
																}</span>
															</button>
															<button id="save-_${ result.data[i]._id }" data-id="_${ result.data[i]['_id'] }" data-table="${pkg.search}"
																class="btn-save btn btn-outline-dark px-3 py-2 d-none" disabled>
																<i class="pe-none pe-1 fa-solid fa-floppy-disk"></i>
																<span class="pe-none lang">${
																	Array('Guardar', 'Save')[lang]
																}</span>
											</button></div></div></div></div>`
										)
									}
								}
								eventAssigner('#rows', 'change', (e) => {findCollections()})
							} catch (error) {
								console.error(error)
								return showSnack(
									Array(
										'Ocurrió un error. Revisa la consola.',
										'An error occurred. Check the console.'
									)[lang], null, 'error'
								)
							} finally {
								// Change in rows displayed
								if(anchorLength != pkg.limit || anchorCollection != pkg.search) {
									// Remove the current rows and show new ones with the new limit
									anchorLength = pkg.limit
									anchorCollection = pkg.search

									$e('#reg-total').innerHTML = result.count
									let numPages = result.count/pkg.limit

									$a('.num-page').forEach(node => { node.remove() })

									for(i=0; i<numPages; i++) {
										if(i > 4) {
											$e('#pag-ctrl').insertAdjacentHTML(
												'beforeend',
												`<a class="num-page user-select-none d-none" rel="${i}">${(i+1)}</a>`
											)
										} else {
											$e('#pag-ctrl').insertAdjacentHTML(
												'beforeend',
												`<a class="num-page user-select-none" rel="${i}">${(i+1)}</a>`
											)
										}
									}

									eventAssigner('.num-page', 'click', (e) => {
										let rel = parseInt(e.target.rel),
											lastRel = parseInt($e('.num-page:last-child').rel)
											margin = [2, 2]

										if((rel-1) == 0) margin = [1, 3] // Left buttons displayed (nearby limit)
										else if((rel-2) < 0) margin = [0, 4] // Left buttons displayed (limit)

										if((rel+1) == lastRel) margin = [3, 1] // Right buttons displayed (nearby limit)
										else if((rel+2) > lastRel) margin = [4, 0] // Right buttons displayed (limit)

										$a('.num-page').forEach(node => {
											if(node.classList.contains('active'))
												node.classList.remove('active')
											if(node.rel != e.target.rel)
												node.classList.add('d-none')
										})
										e.target.classList.add('active')
										$a('.num-page').forEach(node => {
											let f_rel = parseInt(node.rel)
											if(f_rel >= (rel-margin[0]) && parseInt(node.rel) < rel) {
												node.classList.remove('d-none')
											}
											if(f_rel <= (rel+margin[1]) && parseInt(node.rel) > rel) {
												node.classList.remove('d-none')
											}
										})

										findCollections()
									})

									$e('.num-page[rel="0"]').click()
								}

								$a('#collector .dynamic-hint').forEach(node => {
									node.parentElement.insertAdjacentHTML(
										'beforeend',
										'<div class="modal-hint hide mt-1 bg-light rounded-3 shadow-lg position-absolute"></div>'
									)
								})
								eventAssigner('#collector .dynamic-hint', 'focusin', (e) => modalHintDisplay(e, true))
								eventAssigner('#collector .dynamic-hint', 'focusout', (e) => modalHintDisplay(e, false))
								eventAssigner('#collector .dynamic-hint', 'keydown', (e) => dynamicHints(e, 'user_info'))
								eventAssigner('#collector .dynamic-hint', 'change', (e) => dynamicHints(e, 'user_info'))

								eventUnassigner('.btn-edit', 'click', editInfo)
								eventUnassigner('.btn-cancel', 'click', cancelInfo)
								eventUnassigner('.btn-save', 'click', updateInfo)
								eventUnassigner('input:not(.read-only)', 'change', highlighter)

								eventAssigner('.btn-edit', 'click', editInfo)
								eventAssigner('.btn-cancel', 'click', cancelInfo)
								eventAssigner('.btn-save', 'click', updateInfo)
								eventAssigner('input:not(.read-only)', 'change', highlighter)
							}
						}
					} else {
						$e('#collector-accordion').insertAdjacentHTML(
							'afterbegin',
							`<td id="empty" colspan="5" class="border-0 text-center">
								<div class="text-center">
									<i class="fa-solid fa-ghost icon-ghost f-vScreen-15 my-3 text-black-15"></i>
									<p class="my-2 text-ghost fs-4">${
										Array('No hay datos para mostrar', 'No records to show')[lang]
									}</p>
							</div></td>`
						)
					}
				} else {
					console.error(result)
					showSnack(result.msg, null, 'error')
				}
			},
			(error) => console.error(error)
		)
	}

	setTimeout(() => {
		$e('#reload-list').classList.remove('rotate')
	}, 200)
}